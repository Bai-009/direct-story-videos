# Direct Story Videos

A judgment-driven skill for AI-assisted video direction, reconstruction and review. It covers narrative, visual language, transitions, pacing, sound, continuity and version-bound evidence.

Choose palette, medium, story structure and sound from the work's purpose, audience, viewing conditions and available material. Explain the choice, the conditions that would change it, and how the result will be evaluated.

For new films and substantial reconstructions, use [content-to-screen development](../skills/direct-story-videos/references/content-to-screen.md): understand how the subject works, identify what the audience needs to notice, and derive observable changes before arranging shots and sound. [Two worked examples](../skills/direct-story-videos/references/content-to-screen-examples.md) trace the choices for a cloud-agent story and an LLM explanation. Their proposed effects still need motion studies and viewing feedback.

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

[Style Lab](../examples/style-lab/README.md) contains eight actual, frame-driven Remotion motion studies: ink explanation, kinetic typography, flat graphic performance, paper space, isometric flow, pixel action, native 3D geometry and a generative field. They run for 12–16 seconds each, totaling 113 seconds, at 1920×1080 and 30 fps, silent. No generated still-image assets are used. Run `npm ci` and `npm run dev` inside `examples/style-lab/` to play and edit them. [Complete animated GIF previews and Full HD source-frame gallery](motion-studies.md) and [directing rationale](../examples/style-lab/DIRECTING.md) explain scope and choices. The eight complete GIF previews are 960×540 at nominal 15 fps, original speed, silent and looping; source compositions remain 1920×1080 at 30 fps. No pre-rendered MP4 is included.

The [main README](../README.md) includes eight native **1920×1080 PNG** frames from two video projects. Click the images for full resolution. They document choices made for those projects. Viewer comprehension requires separate feedback. Complete film source and audio are not included.

Skill, scripts and documentation: [MIT](../LICENSE). Example PNGs and GIF previews: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), attribution Bai-009; see [image notes](images/README.md). Third-party trademark rights are not granted.
