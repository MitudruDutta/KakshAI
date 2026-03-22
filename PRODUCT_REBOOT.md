# Product Reboot: What KakshAI Should Actually Become

This document is the honest version.

Execution follow-up: [PRD_V2.md](./PRD_V2.md)

The current product is impressive, but it is still too close to a hackathon demo:
- too much emphasis on generation
- too much emphasis on spectacle
- not enough emphasis on learning outcomes
- not enough emphasis on trust, persistence, and product fundamentals

If this stays a pure Next.js + IndexedDB + provider-key-in-the-browser app, it will remain a polished toy.

## Brutal Assessment

### What the product is today

KakshAI currently feels like:
- an AI-generated classroom simulator
- a multi-agent demo
- a strong visual and voice prototype
- a local-first experiment

That is good for demos, hackathons, and GitHub stars.
It is not yet good enough to become a real learning product.

### What is weak right now

1. The core value proposition is fuzzy.
   Users do not primarily want an "AI classroom". They want to learn faster, remember more, and pass something important.

2. The product is over-invested in presentation.
   Slides, roundtables, AI classmates, and voice are engaging, but they do not automatically improve learning.

3. The product does not yet have a strong mastery loop.
   It generates content well, but it does not yet prove that the learner understood anything.

4. The product has weak persistence and identity.
   No serious auth, no serious database, no proper server-owned learning history, no durable user model.

5. The backend is not product-grade.
   Route handlers plus client-owned state are fine for a prototype. They are not enough for a multi-session, multi-user, observable learning platform.

6. The trust model is weak.
   If the system teaches from PDFs and web sources, the user needs citations, source grounding, edit controls, and teacher review flows.

## New Product Thesis

KakshAI should stop selling "an AI classroom" as the core idea.

It should become:

> An adaptive AI learning coach that turns any source or goal into a guided lesson, checks understanding continuously, and builds a long-term mastery profile.

That is a better product.
It is clearer, more useful, and more defensible.

## Product Positioning

### Primary use case

Help a learner go from:
- "I need to understand this topic"
- "I have this PDF / URL / chapter / syllabus"
- "I have an exam / assignment / interview / project"

to:
- a personalized lesson path
- interactive explanation
- practice and feedback
- a mastery score
- a follow-up review plan

### Secondary use case

Help teachers and creators:
- generate structured lessons
- edit and approve them
- assign them to learners
- track completion and weak areas

### What should no longer be the headline

- "multi-agent classroom"
- "AI classmates"
- "one-click classroom generation"

These can stay in the product, but they should not be the product thesis.

## What Should Be Kept

These are genuinely strong:

- document-to-lesson generation
- scene-based teaching flow
- voice mode
- whiteboard actions
- quiz and interactive scene support
- local editing and rendering primitives
- source ingestion from PDF and web

These are good building blocks. The problem is product framing, not total lack of capability.

## What Should Be Reduced Or Repositioned

### Multi-agent classroom

Keep it as:
- engagement mode
- debate mode
- roleplay mode
- language practice mode

Do not keep it as the default learning experience.

For most users, one excellent tutor is better than five entertaining agents.

### Voice

Keep it, but focus it.

Voice is strongest for:
- language learning
- oral exam prep
- interview prep
- tutoring for younger learners
- hands-free mobile learning

Voice should be a mode, not the entire identity of the product.

### Generated slides

Slides are useful, but they should serve instruction, not dominate it.

Too many AI learning products become slide factories.
That is not a moat.

## The Product That Should Exist

### Core loop

1. Learner sets a goal
   Example: "Help me pass tomorrow's thermodynamics quiz in 45 minutes."

2. System runs a short diagnostic
   It estimates skill level, gaps, confidence, and urgency.

3. System builds a guided lesson path
   Not just scenes, but an ordered learning plan with checkpoints.

4. System teaches interactively
   Explanation, examples, whiteboard work, questions, and quick checks.

5. System measures understanding
   Retrieval practice, short quizzes, oral responses, reflection prompts.

6. System updates mastery profile
   It stores what the user likely knows, partially knows, and does not know.

7. System schedules follow-up
   Review, spaced repetition, next lesson, or assignment support.

### Core product pillars

#### 1. Goal-driven learning

The unit of value should be a learning goal, not a classroom artifact.

#### 2. Adaptive teaching

The system should change difficulty, speed, explanation style, and examples based on the learner.

#### 3. Grounded content

Every important claim should be tied to:
- uploaded document
- trusted web source
- teacher-approved source set

#### 4. Measured mastery

The system must track:
- skill coverage
- confidence
- mistakes
- improvement over time

#### 5. Durable identity

The user should come back to:
- their courses
- their learning history
- their notes
- their weak topics
- their assigned lessons

## Features That Matter More Than New Gimmicks

If resources are limited, build these before more flashy generation features:

1. Diagnostic quiz before lesson generation
2. Mastery scoring after each session
3. Source citations and fact grounding
4. Editable lesson plans
5. Learner memory and progress tracking
6. Teacher dashboard and assignment flow
7. Review mode and spaced repetition
8. Mobile-first voice sessions

## Product Changes Needed

### A. Change the primary object

Right now the product revolves around a generated classroom.

It should revolve around a `Learning Goal` and a `Learning Session`.

Good top-level objects:
- Goal
- Source Pack
- Lesson Plan
- Session
- Assessment
- Mastery Map

### B. Make learning measurable

The system needs first-class support for:
- pre-test
- in-session checks
- post-test
- confidence tracking
- error categorization
- revision recommendations

Without this, it is just content generation wearing an education costume.

### C. Add strong control surfaces

Serious users need control over:
- difficulty
- lesson length
- language
- tone
- pedagogy style
- source strictness
- citation mode
- allowed tools
- generation budget

### D. Support two distinct personas

#### Learner mode

- quick goal input
- adaptive tutoring
- voice or text
- progress tracking

#### Teacher mode

- lesson review
- edit and approve
- assign to students
- see performance data

Trying to serve both with the same surface will keep the product muddy.

## Non-Negotiable Platform Additions

This part is not optional if the goal is a real product.

### 1. Authentication

You need real auth.

At minimum:
- email login
- magic link or OAuth
- session management
- role support
- workspace or organization support later

Why:
- save progress across devices
- protect private materials
- support assignments and collaboration
- support billing
- support usage limits

No auth means no real user graph.

### 2. Database

You need a real database.

IndexedDB is fine for local caching and offline UX.
It is not the source of truth for a real learning platform.

You need durable server-owned records for:
- users
- organizations
- courses
- source documents
- lesson plans
- scenes
- chat sessions
- transcripts
- quiz attempts
- mastery state
- usage logs
- billing state

Recommended source-of-truth database:
- PostgreSQL

Keep IndexedDB only as:
- cache
- offline draft store
- local media cache

### 3. Proper Backend

You need a backend that owns the product state.

The blunt truth:
- client-owned state is acceptable for a prototype
- server-owned state is required for a product

The backend should own:
- authentication and sessions
- authorization
- lesson creation
- generation jobs
- usage tracking
- source ingestion
- persistence
- rate limiting
- billing hooks
- analytics events

### 4. Job System

Generation, TTS, media, parsing, and enrichment should not all live as direct request-response flows.

You need async jobs for:
- source ingestion
- PDF parsing
- web extraction
- lesson generation
- media generation
- TTS generation
- transcript processing
- analytics aggregation

Without a job system, the product will stay flaky under real load.

### 5. Object Storage

You need durable storage for:
- uploaded PDFs
- generated images
- audio
- video
- exported lessons
- lesson snapshots

Do not rely on browser storage for product artifacts.

### 6. Observability

You need:
- structured logs
- request tracing
- generation tracing
- cost tracking per provider
- failure dashboards
- moderation and abuse visibility

If multiple AI providers are involved, cost and failure visibility is mandatory.

## Honest Architecture Direction

### Short-term acceptable path

Keep the web app in Next.js, but add:
- real auth
- PostgreSQL
- Redis for rate limiting and queue coordination
- server-owned lesson records
- background workers

This is the fastest path to legitimacy.

### Better long-term path

Split responsibilities clearly:

- Web App
  - Next.js frontend
  - thin server-side BFF endpoints

- Core Backend API
  - owns domain logic
  - lesson generation orchestration
  - persistence
  - authz rules
  - usage accounting

- Worker Service
  - async generation and media jobs

This does not need to become microservice theater.
But it does need a real backend boundary.

## Minimum Backend Capabilities

### Auth

- user signup/login
- OAuth and email magic link
- session invalidation
- role model: learner, teacher, admin

### Database

- users
- organizations or workspaces
- memberships
- source packs
- documents
- lesson plans
- sessions
- messages
- attempts
- mastery records
- artifacts
- provider usage

### Queue / async

- generation jobs
- retry policy
- status polling or websocket updates
- dead-letter handling

### Storage

- document uploads
- generated media
- exports

### Governance

- rate limits
- abuse controls
- audit logs
- provider key management

## Suggested Domain Model

### Core entities

- `User`
- `Workspace`
- `Membership`
- `LearningGoal`
- `SourcePack`
- `Document`
- `LessonPlan`
- `LessonSection`
- `LearningSession`
- `SessionMessage`
- `Assessment`
- `AssessmentAttempt`
- `Skill`
- `LearnerSkillState`
- `Artifact`
- `ProviderUsageEvent`

### Important relationships

- a user has many goals
- a goal can have many source documents
- a goal can produce many lesson plans
- a lesson plan can have many sessions
- a session can have many attempts and transcripts
- learner skill state evolves across sessions, not per single classroom

That last point matters.
The product should remember the learner, not just the generated class.

## The Most Important UX Change

The home screen should stop asking:

> "What topic do you want to generate?"

It should ask:

> "What are you trying to achieve, by when, and what material do you already have?"

That changes the whole product from generator to coach.

## What To Build In Order

### Phase 1: Make it a real product

- auth
- PostgreSQL
- server-owned classrooms and sessions
- document upload pipeline
- durable lesson records
- usage logging

### Phase 2: Make it a real learning product

- diagnostic quiz
- mastery scoring
- post-session review
- learner memory
- citation and grounding

### Phase 3: Make it scalable

- async workers
- object storage
- queue retries
- analytics
- moderation
- billing

### Phase 4: Add differentiated experiences

- voice-first tutoring
- debate mode
- roleplay mode
- teacher assignments
- classroom sharing

## What To Stop Doing

- stop treating every new provider integration as product progress
- stop treating more generated scenes as higher value
- stop assuming multi-agent means better learning
- stop storing critical product state only on the client
- stop optimizing for the demo before optimizing for retention

## Final Verdict

The current idea is not bad.
It is just undisciplined.

The strongest version of KakshAI is not:
- "AI makes a classroom"

It is:
- "AI gets a learner to mastery using their own material, with a persistent memory, measurable outcomes, and trusted guidance"

That version needs:
- auth
- database
- real backend ownership
- jobs
- storage
- evaluation

Without those, the product remains impressive but shallow.
