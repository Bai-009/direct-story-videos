"""Behavior checks for the evidence planner; run with unittest discovery."""

import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest


MODULE = Path(__file__).resolve().parents[1] / "skills/direct-story-videos/scripts/video_workflow.py"
SPEC = importlib.util.spec_from_file_location("video_workflow", MODULE)
workflow = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(workflow)


class EvidenceWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "source.tsx").write_text("actual source v1", encoding="utf-8")
        (self.root / "voice.wav").write_bytes(b"a media fixture\x00\x01")
        self.spec_path = self.root / "review-spec.json"
        self.spec = {
            "schema_version": 1, "example_only": False, "project": "test",
            "fps": 24, "duration_frames": 240, "context_frames": 6,
            "sources": ["source.tsx", "voice.wav"],
            "shots": [{"id": "before", "start": 0, "end": 120},
                      {"id": "after", "start": 120, "end": 240}],
            "transitions": [{"id": "match", "start": 112, "end": 128}],
            "actions": [{"id": "contact", "frames": [170, 180]}],
            "dense_ranges": [{"id": "fall", "start": 164, "end": 181, "step": 2}],
        }
        self.write_spec()

    def write_spec(self):
        self.spec_path.write_text(json.dumps(self.spec), encoding="utf-8")

    def save_plan(self):
        target = self.root / "review-plan.json"
        target.write_text(json.dumps(workflow.make_plan(self.spec_path)), encoding="utf-8")
        return target

    def cli(self, *args):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return workflow.main(list(map(str, args)))

    def test_covers_scene_edges_seam_context_and_action_contact(self):
        plan = workflow.make_plan(self.spec_path)
        frames = [item["frame"] for item in plan["frames"]]
        self.assertEqual(frames, sorted(set(frames)))
        self.assertTrue({0, 119, 120, 239, 114, 126, 169, 170, 171, 179, 180, 181} <= set(frames))
        self.assertTrue(all(0 <= frame < 240 for frame in frames))
        self.assertEqual(plan["status"], "planned-not-reviewed")

    def test_overlapping_reasons_survive_deduplication(self):
        plan = workflow.make_plan(self.spec_path)
        contact = next(item for item in plan["frames"] if item["frame"] == 180)
        self.assertIn("action:contact", contact["reasons"])
        self.assertIn("dense:fall", contact["reasons"])

    def test_source_change_invalidates_plan(self):
        target = self.save_plan()
        self.assertEqual(workflow.verify_plan(target), [])
        (self.root / "source.tsx").write_text("new geometry", encoding="utf-8")
        self.assertIn("sources", workflow.verify_plan(target))
        self.assertEqual(self.cli("verify", target), 1)

    def test_media_change_invalidates_plan(self):
        target = self.save_plan()
        (self.root / "voice.wav").write_bytes(b"new actual narration")
        self.assertIn("sources", workflow.verify_plan(target))

    def test_spec_change_invalidates_plan_even_with_same_frame_samples(self):
        target = self.save_plan()
        self.spec["project"] = "revised intent"
        self.write_spec()
        self.assertIn("spec_sha256", workflow.verify_plan(target))

    def test_missing_media_never_passes_verification(self):
        target = self.save_plan()
        (self.root / "voice.wav").unlink()
        self.assertEqual(self.cli("verify", target), 2)

    def test_edited_plan_cannot_drop_inputs_or_frames(self):
        target = self.save_plan()
        plan = json.loads(target.read_text())
        plan["sources"].pop()
        plan["frames"].pop()
        target.write_text(json.dumps(plan))
        self.assertTrue({"sources", "frames"} <= set(workflow.verify_plan(target)))

    def test_gap_and_overlap_both_fail(self):
        for start in (119, 121):
            with self.subTest(start=start):
                self.spec["shots"][1]["start"] = start
                self.write_spec()
                with self.assertRaises(workflow.SpecError):
                    workflow.make_plan(self.spec_path)

    def test_uncovered_end_fails(self):
        self.spec["shots"][-1]["end"] = 239
        self.write_spec()
        self.assertEqual(self.cli("plan", self.spec_path), 2)
        self.assertFalse((self.root / "review-plan.json").exists())

    def test_example_cannot_masquerade_as_actual_plan(self):
        self.spec["example_only"] = True
        self.write_spec()
        with self.assertRaises(workflow.SpecError):
            workflow.make_plan(self.spec_path)

    def test_out_of_range_and_invalid_frames_fail(self):
        for frame in (-1, 240, 12.5, True):
            with self.subTest(frame=frame):
                self.spec["actions"][0]["frames"] = [frame]
                self.write_spec()
                with self.assertRaises(workflow.SpecError):
                    workflow.make_plan(self.spec_path)

    def test_duplicate_identity_fails(self):
        self.spec["actions"][0]["id"] = "before"
        self.write_spec()
        with self.assertRaises(workflow.SpecError):
            workflow.make_plan(self.spec_path)

    def test_duplicate_resolved_source_fails(self):
        self.spec["sources"].append("./source.tsx")
        self.write_spec()
        with self.assertRaises(workflow.SpecError):
            workflow.make_plan(self.spec_path)

    def test_dense_range_requires_bounded_positive_step(self):
        for step in (0, -1, True):
            with self.subTest(step=step):
                self.spec["dense_ranges"][0]["step"] = step
                self.write_spec()
                with self.assertRaises(workflow.SpecError):
                    workflow.make_plan(self.spec_path)

    def test_non_integer_fps_and_one_frame_film(self):
        self.spec.update(fps=29.97, duration_frames=1, shots=[{"id": "tiny", "start": 0, "end": 1}],
                         transitions=[], actions=[], dense_ranges=[])
        self.write_spec()
        plan = workflow.make_plan(self.spec_path)
        self.assertEqual([item["frame"] for item in plan["frames"]], [0])

    def test_invalid_fps_fails(self):
        for fps in (0, -1, float("nan"), float("inf"), True):
            with self.subTest(fps=fps):
                self.spec["fps"] = fps
                self.write_spec()
                with self.assertRaises(workflow.SpecError):
                    workflow.make_plan(self.spec_path)

    def test_init_preserves_existing_work(self):
        project = self.root / "new-project"
        self.assertEqual(self.cli("init", project), 0)
        intent = project / "production/intent.md"
        intent.write_text("user changed the actual intent", encoding="utf-8")
        self.assertEqual(self.cli("init", project), 0)
        self.assertEqual(intent.read_text(), "user changed the actual intent")
        self.assertEqual(self.cli("plan", project / "production/review-spec.json"), 2)

    def test_plan_requires_explicit_overwrite(self):
        self.assertEqual(self.cli("plan", self.spec_path), 0)
        target = self.root / "review-plan.json"
        original = target.read_bytes()
        self.assertEqual(self.cli("plan", self.spec_path), 2)
        self.assertEqual(target.read_bytes(), original)
        self.assertEqual(self.cli("plan", self.spec_path, "--replace"), 0)
        self.assertEqual(self.cli("verify", target), 0)

    def test_plan_cannot_overwrite_an_input_even_when_replace_requested(self):
        original = self.spec_path.read_bytes()
        self.assertEqual(self.cli("plan", self.spec_path, "--out", self.spec_path, "--replace"), 2)
        self.assertEqual(self.spec_path.read_bytes(), original)
        source = self.root / "source.tsx"
        self.assertEqual(self.cli("plan", self.spec_path, "--out", source, "--replace"), 2)
        self.assertEqual(source.read_text(), "actual source v1")


if __name__ == "__main__":
    unittest.main()
