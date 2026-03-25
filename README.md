# KakshAI

An AI-powered interactive classroom generation platform that transforms educational content into immersive, multi-agent learning experiences.

## Overview

KakshAI (कक्षा AI, where "कक्षा" means "classroom" in Hindi) is a next-generation educational platform that leverages artificial intelligence to create dynamic, interactive classroom environments. It converts educational materials — PDFs, URLs, topics, or user requirements — into engaging learning experiences featuring AI-generated scenes, virtual teaching agents, voice interactions, interactive presentations, and real-time chat tutoring.

## Features

### Content Generation Pipeline
- **PDF Processing**: Extract text and images from uploaded PDF documents using multiple provider backends
- **Web Scraping**: Automatically scrape and process content from URLs via Firecrawl integration
- **AI Outlining**: Generate structured lesson outlines from raw content using LLM providers
- **Scene Generation**: Create rich, multi-scene classrooms with automated content generation

### Interactive Classroom Runtime
- **Stage-Based Learning**: Sequential scene navigation with playback controls
- **Multi-Agent System**: Virtual teaching agents with distinct personalities, avatars, and teaching styles
- **Voice Integration**: High-quality text-to-speech using ElevenLabs with multiple voice options
- **Voice Agents**: Real-time voice conversations with AI agents powered by ElevenLabs Conversational AI
- **Chat Interface**: Context-aware tutoring with streaming responses and action support

### Presentation & Content Types
- **Slide Renderer**: Full-featured slide editor with support for:
  - Text elements with rich formatting
  - Images and shapes
  - Tables and charts
  - Mathematical expressions (LaTeX via KaTeX/Temml)
  - Alignment, layering, and grouping
- **Interactive Scenes**: HTML-based interactive learning modules
- **Quiz Generation**: Auto-generated assessments with multiple question types
- **PBL Mode**: Project-Based Learning with collaborative workspaces and issue tracking

### AI Capabilities
- **Multi-Provider Support**: OpenAI, Anthropic, Google Gemini, Groq, Ollama
- **Streaming Responses**: Real-time token streaming for chat and generation
- **Tool Use**: Function calling for actions like navigation, canvas operations, and scene control
- **LangGraph Orchestration**: State-machine based conversation flow with director graph
- **Media Generation**: AI-powered image and video generation for classroom content

### Technical Highlights
- **Local-First Architecture**: IndexedDB persistence via Dexie for offline capability
- **Provider-Agnostic**: Configurable AI providers with runtime resolution
- **Rate Limiting**: Built-in protection via Upstash Redis
- **Type-Safe**: Full TypeScript coverage with strict type checking
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS and shadcn/ui

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16.1.2, React 19.2.3 |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix UI primitives |
| **State Management** | Zustand 5.x with persistence |
| **Database** | IndexedDB via Dexie 4.x (local-first) |
| **AI/ML SDKs** | Vercel AI SDK 6.x, LangChain Core, LangGraph |
| **Voice** | ElevenLabs SDK, Azure TTS |
| **PDF** | unpdf, pdf-parse |
| **Web Search** | Firecrawl |
| **Animation** | Motion (Framer Motion successor), Animate.css |
| **Charts** | ECharts 6.x |
| **Package Manager** | pnpm 10.x |

## Getting Started

### Prerequisites

- **Node.js**: >= 20.9.0
- **pnpm**: 10.28.0+ (project uses pnpm workspaces)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd KakshAI

# Install dependencies (includes postinstall build for workspace packages)
pnpm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Quick Start

1. **Configure AI Providers**: Open settings (gear icon) and add your API keys for at least one LLM provider
2. **Create a Classroom**: Enter a topic or upload a PDF on the landing page
3. **Generate Content**: Review the AI-generated outline and confirm to start scene generation
4. **Launch Classroom**: Navigate to the classroom to experience the interactive learning environment

## Project Structure

```
KakshAI/
├── app/                          # Next.js App Router
│   ├── api/                      # API route handlers
│   │   ├── chat/                 # Chat API with streaming SSE
│   │   ├── generate-*/           # Content generation endpoints
│   │   ├── parse-pdf/            # PDF parsing service
│   │   ├── scrape-url/           # Web scraping via Firecrawl
│   │   └── server-providers/     # Provider configuration
│   ├── classroom/[id]/           # Classroom runtime page
│   ├── generation-preview/       # Content generation UI
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing page
│
├── components/                   # React components
│   ├── agent/                    # Voice agent components
│   ├── ai-elements/              # Reusable AI UI primitives
│   │   ├── artifact.tsx          # Content artifact display
│   │   ├── chain-of-thought.tsx  # Reasoning visualization
│   │   ├── checkpoint.tsx        # Confirmation dialogs
│   │   ├── code-block.tsx        # Syntax-highlighted code
│   │   └── ...                   # 20+ UI primitives
│   ├── chat/                     # Chat interface
│   ├── generation/               # Generation UI components
│   ├── landing/                  # Landing page sections
│   ├── roundtable/               # Multi-agent discussion
│   ├── scene-renderers/          # Scene type renderers
│   │   ├── interactive-renderer.tsx
│   │   ├── pbl-renderer.tsx
│   │   └── quiz-renderer.tsx
│   ├── settings/                 # Settings panels
│   ├── slide-renderer/           # Presentation editor
│   ├── stage.tsx                 # Main stage component
│   └── ui/                       # shadcn/ui components
│
├── lib/                          # Core utilities
│   ├── ai/                       # AI utilities
│   ├── api/                      # Client API abstractions
│   │   └── stage-api*.ts         # Stage API methods
│   ├── audio/                    # TTS/ASR utilities
│   ├── export/                   # Export functionality
│   ├── generation/               # Generation pipeline
│   │   ├── prompts/              # Prompt templates
│   │   ├── action-parser.ts
│   │   └── generation-pipeline.ts
│   ├── hooks/                    # Custom React hooks
│   ├── i18n/                     # Internationalization
│   ├── media/                    # Media generation
│   ├── orchestration/            # AI orchestration
│   │   ├── director-graph.ts     # LangGraph workflow
│   │   ├── stateless-generate.ts
│   │   └── prompt-builder.ts
│   ├── pbl/                      # PBL/MCP utilities
│   ├── playback/                 # Playback engine
│   ├── prosemirror/              # Rich text editor
│   ├── server/                   # Server-side utilities
│   ├── storage/                  # Storage abstractions
│   ├── store/                    # Zustand stores
│   │   ├── canvas.ts             # Canvas state
│   │   ├── settings.ts           # App settings
│   │   └── stage.ts              # Stage state
│   └── types/                    # TypeScript types
│
├── packages/                     # Workspace packages
│   ├── mathml2omml/              # MathML to OMML converter
│   └── pptxgenjs/                # PowerPoint generation
│
├── configs/                      # Configuration files
├── skills/                       # Claude Code skills
├── public/                       # Static assets
└── ...
```

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         KAKSHAI ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LANDING PAGE          GENERATION PREVIEW         CLASSROOM         │
│  (app/page.tsx)        (app/generation-         (app/classroom/    │
│                        preview/page.tsx)          [id]/page.tsx)    │
│       │                        │                        │          │
│       ▼                        ▼                        ▼          │
│  ┌─────────┐            ┌─────────────┐          ┌─────────────┐   │
│  │  Form   │            │   Pipeline  │          │    Stage    │   │
│  │ Input   │───────────▶│   Runner    │─────────▶│   Runtime   │   │
│  │         │            │             │          │             │   │
│  │ - Topic │            │ - Parse PDF │          │ - Playback  │   │
│  │ - PDF   │            │ - Web Search│          │ - Chat      │   │
│  │ - URL   │            │ - Agents    │          │ - Voice     │   │
│  │ - Lang  │            │ - Outlines  │          │ - Canvas    │   │
│  └─────────┘            │ - Scenes    │          │ - Whiteboard│   │
│                         └─────────────┘          └─────────────┘   │
│                                │                        │          │
│                                ▼                        ▼          │
│                         ┌─────────────┐          ┌─────────────┐   │
│                         │   IndexedDB │◀─────────│   Dexie     │   │
│                         │   (Dexie)   │          │   Stores    │   │
│                         └─────────────┘          └─────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      API ROUTES                              │   │
│  │  /api/chat              /api/generate/tts                     │   │
│  │  /api/generate-classroom        /api/generate/video         │   │
│  │  /api/parse-pdf         /api/scrape-url                     │   │
│  │  /api/server-providers  /api/elevenlabs/*                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Runtime Layers

1. **Input Layer**: Landing page collects user requirements, topic, PDF, URL, and provider preferences
2. **Generation Pipeline**: Client-side orchestration of content generation with progress tracking
3. **Classroom Runtime**: Interactive stage with playback, chat, voice, and collaboration
4. **Persistence Layer**: Dexie-based IndexedDB storage with optional server fallback
5. **Orchestration**: LangGraph-driven conversation flow with tool use capabilities

### Key Design Patterns

- **Local-First**: All data stored in IndexedDB; server is optional for persistence
- **Provider-Agnostic**: Runtime resolution of AI providers with configurable fallbacks
- **Streaming-First**: SSE-based streaming for chat and generation progress
- **Stateless Chat**: Each chat request includes full context; no server-side session state
- **Component Composition**: Reusable AI UI primitives for consistent experience

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# --- LLM Providers (at least one required) ---
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GROQ_API_KEY=...
OLLAMA_API_KEY=...

# --- TTS Providers ---
TTS_ELEVENLABS_API_KEY=...
TTS_AZURE_API_KEY=...

# --- Voice Agents (ElevenLabs) ---
ELEVENLABS_API_KEY=...
ELEVENLABS_AGENT_ID=...

# --- Web Search ---
FIRECRAWL_API_KEY=...

# --- Image/Video Generation ---
IMAGE_NANO_BANANA_API_KEY=...
VIDEO_VEO_API_KEY=...

# --- Optional: Server-side Rate Limiting ---
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# --- Optional: Default Model ---
DEFAULT_MODEL=google:gemini-2-flash
```

See `.env.example` for all available options.

### Provider Configuration

Providers can also be configured via YAML files in `configs/`:

```yaml
# configs/server-providers.yml
providers:
  openai:
    apiKey: ${OPENAI_API_KEY}
    baseUrl: https://api.openai.com/v1
    models:
      - gpt-4o
      - gpt-4o-mini

  anthropic:
    apiKey: ${ANTHROPIC_API_KEY}
    models:
      - claude-3-5-sonnet-20241022
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint checks |
| `pnpm check` | Check Prettier formatting |
| `pnpm format` | Format code with Prettier |

## Development

### Adding a New Scene Type

1. Create a new renderer component in `components/scene-renderers/`
2. Add type definitions in `lib/types/scene.ts`
3. Update the scene switcher in `components/stage.tsx`
4. Add generation prompt in `lib/generation/prompts/templates/`

### Adding an AI Provider

1. Add provider configuration in `lib/server/resolve-model.ts`
2. Update settings store in `lib/store/settings.ts`
3. Add UI configuration panel in `components/settings/`

### Working with Prompts

Prompts are stored in `lib/generation/prompts/templates/` as Markdown files:

```markdown
---
id: my-prompt
description: My custom prompt
variables:
  - topic
  - language
---

Generate content about {{topic}} in {{language}}.
```

Load and use:

```typescript
import { buildPrompt, PROMPT_IDS } from '@/lib/generation/prompts';

const prompt = await buildPrompt(PROMPT_IDS.SLIDE_CONTENT, {
  topic: 'Physics',
  language: 'English'
});
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t kakshai .

# Run container
docker run -p 3000:3000 --env-file .env.local kakshai
```

### Self-Hosted

```bash
# Build
pnpm build

# Start
pnpm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for the excellent AI abstractions
- [ElevenLabs](https://elevenlabs.io/) for voice synthesis and conversational AI
- [Firecrawl](https://firecrawl.dev/) for web scraping capabilities
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component primitives
- [LangChain](https://langchain.com/) for orchestration tools

---

Built with ❤️ by the KakshAI team