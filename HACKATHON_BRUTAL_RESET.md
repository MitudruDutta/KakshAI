# Hackathon Brutal Reset

## Brutal Truth

Right now this product still behaves more like a generated slide deck with AI narration than a serious learning experience.

The strongest parts are:

- lesson generation from topic, PDF, and web context
- the stage runtime
- the new voice agent

The weakest parts are:

- too much of the product feels like a creator tool instead of a learner tool
- the classroom fantasy is stronger than the learning loop
- the settings surface is too broad for a 2-day hackathon
- the slide renderer is visually dominant even though it is not the core differentiator

If this stays as-is, the demo risk is obvious: people will say "cool AI classroom" and then fail to understand why it is meaningfully better than chat plus slides.

## Keep The Idea, Change The Center

Do not change the idea into a generic study app.

Keep the same core idea:

- an AI classroom
- a teaching flow
- a voice-led lesson
- visual material on a shared stage

But change what the product is *about*:

From:

- "generate a classroom"

To:

- "run a live AI-guided lesson session with voice, sources, and checkpoints"

That keeps the identity while making the value legible.

## The 2-Day Product Direction

### New Product Thesis

KakshAI is a voice-first AI classroom that turns a topic, PDF, or URL into a guided lesson session with:

- a single lead AI teacher
- source-backed explanations
- visual slides or whiteboard support
- periodic comprehension checks

The session matters more than the generated deck.

### What To Show In The Demo

One clean flow:

1. User enters a topic, PDF, or URL
2. App generates a lesson session
3. User enters the classroom
4. Teacher starts speaking immediately
5. Stage updates as the teacher explains
6. User can interrupt by voice
7. System asks a quick checkpoint question
8. Session ends with recap and next steps

That is a coherent product.

### What To Hide Or Demote

- multi-agent classroom by default
- excessive model/provider configuration in the main experience
- advanced editor energy
- video generation by default
- anything that makes the user feel they are configuring infrastructure

## Brutal Architecture Change Without A Rewrite

Do not waste the next 2 days pretending to build a real backend.

Keep IndexedDB. But stop letting raw storage shape the product.

### New Runtime Boundary

Treat the app as three layers:

1. `Lesson Input`
   Topic, PDF, URL, difficulty, tone

2. `Lesson Session`
   Generated plan, current scene, teacher state, checkpoints, sources

3. `Stage Runtime`
   Slides, whiteboard, playback, voice, chat

The mistake right now is that the stage runtime feels like the product. It should be the renderer for the lesson session.

### Minimal Code Direction

Add one orchestration boundary:

- `lib/services/lesson-session-service.ts`

It should own:

- create lesson session
- load lesson session
- save lesson session snapshot
- update current scene
- update checkpoint state

This is not a backend rewrite. It is a local service boundary so the UI stops reaching into scattered state directly.

### UI Boundary

Make the classroom layout explicitly voice-first:

- left or center: stage
- right: teacher voice panel
- chat and notes as secondary tabs

The voice teacher should not be a side feature anymore.

## What To Cut Immediately

If time is short, cut or hide these before adding anything new:

- multi-agent defaults
- low-value settings in the first-run flow
- weakly differentiated classroom chrome
- any dead provider or old localization baggage
- optional generation branches that make the product look inconsistent

## Recommended 2-Day Build Order

### Day 1

- remove stale provider/model baggage from the UX
- simplify the first-run settings story
- make voice mode the default classroom mode
- make source context visible during the session

### Day 2

- add checkpoint moments during lessons
- tighten the classroom layout around teacher + stage
- improve the lesson entry flow so it feels like starting a session, not configuring a workspace
- polish the end-of-session recap

## Honest Product Positioning

Do not pitch this as:

- an AI slide generator
- a multi-agent simulation platform
- a full learning management system

Pitch it as:

- a live AI classroom session generator and teacher

That is sharper, more believable, and much easier to demo well in 2 days.
