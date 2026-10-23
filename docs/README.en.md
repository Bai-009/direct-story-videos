# Direct Story Videos

A judgment-driven skill for AI-assisted video direction, reconstruction and review. It covers narrative, visual language, transitions, pacing, sound, continuity and version-bound evidence.

The skill does not prescribe a palette, hand-drawn style, story formula or soundtrack. Start from the work's purpose, audience, viewing conditions and available material. Explain the choice, the conditions that would change it, and how the result will be evaluated.

## Install

Clone `https://github.com/Bai-009/direct-story-videos.git` and copy the entire `skills/direct-story-videos/` folder into your agent's skills directory. For Codex, this is normally `~/.codex/skills/`. Compare or back up an existing installation before replacing it.

Invoke `$direct-story-videos` with your actual brief, constraints and artifacts. The instructions are primarily in Chinese; the output language should follow your request. Local edits and read-only reviews do not require a full production restart.

## Tools

Python 3.10+, standard library only:

```bash
python3 skills/direct-story-videos/scripts/video_workflow.py init PROJECT
python3 skills/direct-story-videos/scripts/video_workflow.py plan PROJECT/production/review-spec.json
python3 skills/direct-story-videos/scripts/video_workflow.py verify PROJECT/production/review-plan.json
python3 -B -m unittest discover -s tests -v
```

Replace the generated example with the real timeline, enumerate source and media inputs, and set `example_only` to `false` before planning. Planning records sample frames and hashes. It does not render, play, listen or grade creative quality.

No rendering engine or third-party service is bundled. Remotion-specific work needs the appropriate tools and technical guidance in the execution environment. Using the skill does not authorize publication or external transmission.

## Examples and license

The [main README](../README.md) includes eight native **1920×1080 PNG** frames from two video projects. Click the images for full resolution. They illustrate project-specific choices, not a required style or proof of viewer comprehension. Complete film source and audio are not included.

Skill, scripts and documentation: [MIT](../LICENSE). Example PNGs: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), attribution Bai-009; see [image notes](images/README.md). Third-party trademark rights are not granted.
