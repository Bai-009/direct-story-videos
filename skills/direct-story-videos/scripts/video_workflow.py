#!/usr/bin/env python3
"""Create working documents and version-bound frame plans; never grade a video.

stdlib only. Frame intervals are [start, end). sources are explicit files,
relative to the spec directory; ../src/foo is valid. No directory crawling.
"""

import argparse
import hashlib
import json
import math
from pathlib import Path
import sys


class SpecError(ValueError):
    pass


def digest(path):
    value = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def integer(value, label, minimum=0):
    if type(value) is not int or value < minimum:
        raise SpecError(f"{label}: expected integer >= {minimum}")
    return value


def read_spec(path):
    spec = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(spec, dict) or spec.get("schema_version") != 1:
        raise SpecError("spec.schema_version must be 1")
    if spec.get("example_only") is not False:
        raise SpecError("Replace the example with the real timeline and set example_only=false")
    if not isinstance(spec.get("project"), str) or not spec["project"].strip():
        raise SpecError("project must be a non-empty string")
    fps = spec.get("fps")
    if type(fps) not in (int, float) or not math.isfinite(fps) or not 0 < fps <= 240:
        raise SpecError("fps must be a finite number in (0, 240]")
    duration = integer(spec.get("duration_frames"), "duration_frames", 1)
    integer(spec.get("context_frames", round(fps / 4)), "context_frames")
    sources = spec.get("sources")
    if not isinstance(sources, list) or not sources:
        raise SpecError("sources must list explicit source/media files")
    resolved = set()
    for source in sources:
        if not isinstance(source, str) or not source.strip():
            raise SpecError("sources entries must be non-empty file paths")
        target = (path.parent / source).resolve()
        if not target.is_file():
            raise SpecError(f"Missing source file: {source}")
        if target == path.resolve() or target in resolved:
            raise SpecError(f"Duplicate source or spec listed as source: {source}")
        resolved.add(target)
    shots = spec.get("shots")
    if not isinstance(shots, list) or not shots:
        raise SpecError("shots must be non-empty and cover the timeline in order")
    identifiers = set()

    def identify(item, kind):
        if not isinstance(item, dict):
            raise SpecError(f"{kind}: expected an object")
        name = item.get("id")
        if not isinstance(name, str) or not name.strip() or name in identifiers:
            raise SpecError(f"{kind}: missing or duplicate id {name!r}")
        identifiers.add(name)

    def interval(item, kind):
        identify(item, kind)
        start = integer(item.get("start"), f"{item['id']}.start")
        end = integer(item.get("end"), f"{item['id']}.end", 1)
        if not start < end <= duration:
            raise SpecError(f"{item['id']}: invalid [start, end) interval")
        return start, end

    cursor = 0
    for shot in shots:
        start, end = interval(shot, "shot")
        if start != cursor:
            raise SpecError(f"{shot['id']}: gap, overlap or unordered shots at frame {cursor}")
        cursor = end
    if cursor != duration:
        raise SpecError("shots do not cover duration_frames")
    for key in ("transitions", "actions", "dense_ranges"):
        if not isinstance(spec.get(key, []), list):
            raise SpecError(f"{key} must be a list")
    for transition in spec.get("transitions", []):
        interval(transition, "transition")
    for action in spec.get("actions", []):
        identify(action, "action")
        frames = action.get("frames")
        if not isinstance(frames, list) or not frames:
            raise SpecError(f"{action['id']}: frames must be non-empty")
        for frame in frames:
            if integer(frame, action["id"]) >= duration:
                raise SpecError(f"{action['id']}: frame outside timeline")
    for dense in spec.get("dense_ranges", []):
        start, end = interval(dense, "dense range")
        step = integer(dense.get("step"), f"{dense['id']}.step", 1)
        if (end - start + step - 1) // step > 10000:
            raise SpecError(f"{dense['id']}: more than 10000 samples; choose a smaller range")
    return spec


def make_plan(spec_path):
    spec_path = spec_path.resolve()
    spec = read_spec(spec_path)
    duration, fps = spec["duration_frames"], spec["fps"]
    context = spec.get("context_frames", round(fps / 4))
    frames = {}

    def add(frame, reason):
        if 0 <= frame < duration:
            frames.setdefault(frame, set()).add(reason)

    for shot in spec["shots"]:
        for frame in (shot["start"], (shot["start"] + shot["end"] - 1) // 2, shot["end"] - 1):
            add(frame, f"shot:{shot['id']}")
        if shot["start"]:
            boundary = shot["start"]
            for frame in (boundary - context, boundary - 1, boundary, boundary + context):
                add(frame, f"cut:{shot['id']}")
    for item in spec.get("transitions", []):
        start, end = item["start"], item["end"]
        for frame in (start - 1, start, (start + end - 1) // 2, end - 1, end):
            add(frame, f"transition:{item['id']}")
    for item in spec.get("actions", []):
        for frame in item["frames"]:
            for offset in (-1, 0, 1):
                add(frame + offset, f"action:{item['id']}")
    for item in spec.get("dense_ranges", []):
        for frame in range(item["start"], item["end"], item["step"]):
            add(frame, f"dense:{item['id']}")
        add(item["end"] - 1, f"dense:{item['id']}")
    if len(frames) > 20000:
        raise SpecError("More than 20000 samples; split the plan")
    return {
        "schema_version": 1,
        "project": spec["project"],
        "status": "planned-not-reviewed",
        "limits": "Explicit inputs only; no rendering, playback, listening or aesthetic acceptance.",
        "spec_path": str(spec_path),
        "spec_sha256": digest(spec_path),
        "fps": fps,
        "duration_frames": duration,
        "sources": [
            {"path": str((spec_path.parent / source).resolve()),
             "sha256": digest((spec_path.parent / source).resolve())}
            for source in spec["sources"]
        ],
        "frames": [
            {"frame": frame, "seconds": round(frame / fps, 6), "reasons": sorted(frames[frame])}
            for frame in sorted(frames)
        ],
        "required_manual_checks": [
            "intent and factual claims where applicable",
            "real-time viewing in the intended playback conditions",
            "native and target-size detail where relevant",
            "motion rules and cut context present in this work",
            "actual listening if audio is used",
            "muted-view completeness only if required by delivery; otherwise diagnostic",
            "requested delivery artifact",
            "first-view understanding or experience when feedback is available"
        ]
    }


def verify_plan(path):
    plan = json.loads(path.read_text(encoding="utf-8"))
    # Rebuild from current spec so edited plan metadata cannot silently omit inputs or frames.
    expected = make_plan(Path(plan["spec_path"]))
    changes = []
    for key in ("schema_version", "project", "status", "limits", "spec_path", "spec_sha256",
                "fps", "duration_frames", "sources", "frames", "required_manual_checks"):
        if plan.get(key) != expected[key]:
            changes.append(key)
    return changes


def initialize(project):
    template = Path(__file__).resolve().parent.parent / "assets" / "project-template"
    destination = project / "production"
    destination.mkdir(parents=True, exist_ok=True)
    for source in sorted(template.iterdir()):
        target = destination / source.name
        if target.exists():
            print(f"Preserved: {target}")
        else:
            with target.open("xb") as stream:
                stream.write(source.read_bytes())
            print(f"Created: {target}")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("init").add_argument("project", type=Path)
    planner = commands.add_parser("plan")
    planner.add_argument("spec", type=Path)
    planner.add_argument("--out", type=Path)
    planner.add_argument("--replace", action="store_true", help="replace an existing plan")
    commands.add_parser("verify").add_argument("plan", type=Path)
    args = parser.parse_args(argv)
    try:
        if args.command == "init":
            initialize(args.project)
        elif args.command == "plan":
            plan = make_plan(args.spec)
            target = args.out or args.spec.parent / "review-plan.json"
            inputs = {Path(plan["spec_path"]), *(Path(s["path"]) for s in plan["sources"])}
            if target.resolve() in inputs:
                raise SpecError("Output must not overwrite spec or source inputs")
            with target.open("w" if args.replace else "x", encoding="utf-8") as stream:
                json.dump(plan, stream, ensure_ascii=False, indent=2)
                stream.write("\n")
            print(f"Planned {len(plan['frames'])} frames: {target}; no quality checks performed.")
        else:
            changes = verify_plan(args.plan)
            if changes:
                print("STALE OR EDITED PLAN: " + ", ".join(changes), file=sys.stderr)
                return 1
            print("Listed inputs and plan unchanged. This is not a quality acceptance.")
        return 0
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
