# PRD: KakshAI — AI-Powered Voice-Interactive Classroom

## Context

This codebase started from a legacy interactive classroom prototype that generates lessons from PDFs. It was heavily shaped by earlier language/provider assumptions and still has no real backend (pure serverless Next.js API routes, all state client-side in IndexedDB).

**Goal:** Completely revamp this into **KakshAI** (from Hindi "Kaksha" = classroom) — a rebranded, production-ready product with:
1. Firecrawl Search replacing Tavily for web search (hackathon requirement)
2. ElevenLabs ElevenAgents for real-time voice classroom (hackathon requirement)
3. Proper backend with auth, Redis, rate limiting, database
4. Chinese removed, Hindi + English as supported languages
5. Chinese-only providers removed, international providers retained

**Hackathon:** Firecrawl + ElevenAgents hackathon. Submissions close in ~5 days. Prizes up to $10,990.
---

## 1. Product Rename & Rebrand

### 1.1 Name: KakshAI

| File | Change |
|---|---|
| `package.json:2` | `"name": "kakshai"` |
| `app/layout.tsx:20` | `title: 'KakshAI'` |
| `app/layout.tsx:21-22` | `description: 'AI-powered voice-interactive classroom. Upload a PDF or URL, get an immersive multi-agent learning experience with real-time voice conversations.'` |
| `docker-compose.yml:2` | Service name `kakshai` |
| `app/favicon.ico` | New favicon |
| `app/apple-icon.png` | New icon |
| `AI_CODEBASE_KNOWLEDGE.md` | Full rewrite |
| `README.md` | Full rewrite |
| `README-zh.md` | Delete |

### 1.2 Logo & Assets
- Generate new favicon/logo with "KakshAI" branding
- Update `public/logo-horizontal.png`, `assets/logo-horizontal.png`, `assets/banner.png`

---

## 2. Language Overhaul: Remove Chinese, Add Hindi

### 2.1 i18n System Changes

| File | Change |
|---|---|
| `lib/i18n/types.ts` | `type Locale = 'en-US' \| 'hi-IN'` and `defaultLocale = 'en-US'` |
| `lib/i18n/index.ts` | Replace `zh-CN` key with `hi-IN`. Import `*HiIN` instead of `*ZhCN` |
| `lib/i18n/common.ts` | Replace `commonZhCN` with `commonHiIN` (Hindi translations) |
| `lib/i18n/chat.ts` | Replace `chatZhCN` with `chatHiIN` |
| `lib/i18n/generation.ts` | Replace `generationZhCN` with `generationHiIN` |
| `lib/i18n/settings.ts` | Replace `settingsZhCN` with `settingsHiIN` |
| `lib/i18n/stage.ts` | Replace `stageZhCN` with `stageHiIN` |
| `lib/hooks/use-i18n.tsx:13` | `VALID_LOCALES: ['en-US', 'hi-IN']` |
| `lib/hooks/use-i18n.tsx:29` | Detect `navigator.language?.startsWith('hi')` → `'hi-IN'`, else `'en-US'` |

### 2.2 Agent Names (in `lib/orchestration/registry/store.ts`)

| ID | Current (Chinese) | New (English) |
|---|---|---|
| `default-1` | Legacy teacher preset | `'Lead Tutor'` |
| `default-2` | Legacy assistant preset | `'Learning Guide'` |
| `default-3` | Legacy comic-relief preset | `'Challenger'` |
| `default-4` | Legacy curiosity preset | `'Curious Explorer'` |
| `default-5` | Legacy note-taking preset | `'Notekeeper'` |
| `default-6` | Legacy thinker preset | `'Critical Thinker'` |

### 2.3 Hardcoded Chinese Strings

| File | Line | Fix |
|---|---|---|
| `lib/audio/tts-providers.ts:191` | `xml:lang='zh-CN'` | Make dynamic: pass locale from client |
| `lib/audio/tts-providers.ts:283` | `language_type: 'Chinese'` | Remove with Qwen provider |
| `lib/audio/constants.ts:611` | `'浏览器原生 (Web Speech API)'` | `'Browser Native (Web Speech API)'` |
| `lib/audio/constants.ts:617` | `'默认'` | `'Default'` |
| `lib/audio/constants.ts:749` | `'浏览器原生 ASR (Web Speech API)'` | `'Browser Native ASR (Web Speech API)'` |
| Azure TTS voices | Chinese voice names `晓晓`, `云希` etc. | Replace with English/Hindi Azure voices |

---

## 3. Remove Chinese-Only Providers

### 3.1 LLM Providers to Remove (from `lib/ai/providers.ts` + `lib/types/provider.ts`)

Remove from `ProviderId` union and `PROVIDERS` registry:
- `deepseek` — DeepSeek
- `qwen` — Alibaba Qwen
- `kimi` — Moonshot Kimi
- `minimax` — MiniMax
- `glm` — Zhipu GLM
- `siliconflow` — SiliconFlow

**Keep:** `openai`, `anthropic`, `google`

Also update:
- `lib/server/provider-config.ts` — remove `LLM_ENV_MAP` entries for removed providers
- `.env.example` — remove corresponding env vars
- `configs/` — remove any Chinese provider references

### 3.2 TTS Providers to Remove

Remove from `lib/audio/types.ts`, `lib/audio/constants.ts`, `lib/audio/tts-providers.ts`:
- `glm-tts` — Zhipu GLM TTS (Chinese-only voices)
- `qwen-tts` — Alibaba Qwen TTS (Chinese-only voices)

Remove `TTS_ENV_MAP` entries: `TTS_GLM`, `TTS_QWEN`

**Keep:** `openai-tts`, `azure-tts` (fix hardcoded zh-CN), `browser-native-tts`
**Add:** `elevenlabs-tts` (see Section 5)

### 3.3 ASR Providers to Remove

Remove: `qwen-asr` from `lib/audio/constants.ts`, `lib/audio/asr-providers.ts`
Remove `ASR_ENV_MAP` entry: `ASR_QWEN`

**Keep:** `openai-whisper`, `browser-native`

### 3.4 Image Providers to Remove

Remove from `lib/media/types.ts`, adapters, constants:
- `seedream` — ByteDance
- `qwen-image` — Alibaba

Remove `IMAGE_ENV_MAP` entries, remove adapter files:
- `lib/media/adapters/seedream-adapter.ts`
- `lib/media/adapters/qwen-image-adapter.ts`

**Keep:** `nano-banana`

### 3.5 Video Providers to Remove

Remove:
- `seedance` — ByteDance
- `kling` — Kuaishou

Remove adapters:
- `lib/media/adapters/seedance-adapter.ts`
- `lib/media/adapters/kling-adapter.ts`

**Keep:** `veo` (Google), `sora` (OpenAI)

---

## 4. Firecrawl Search Integration (Replace Tavily)

### 4.1 Core Replacement

**Current:** `lib/web-search/tavily.ts` → `POST https://api.tavily.com/search`
**New:** `lib/web-search/firecrawl.ts` → `POST https://api.firecrawl.dev/v2/search`

#### Files to modify:

| File | Change |
|---|---|
| `lib/web-search/tavily.ts` | Delete → replace with `firecrawl.ts` |
| `lib/web-search/types.ts` | Update `WebSearchResult` / `WebSearchSource` types for Firecrawl response |
| `lib/web-search/constants.ts` | Update provider name, config |
| `app/api/web-search/route.ts` | Switch imports from tavily to firecrawl |
| `lib/server/provider-config.ts:83-85` | Change `WEB_SEARCH_ENV_MAP` from `TAVILY: 'tavily'` to `FIRECRAWL: 'firecrawl'` |
| Settings UI | Update API key label from "Tavily" to "Firecrawl" |

#### New `lib/web-search/firecrawl.ts`:

```typescript
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v2/search';

export async function searchWithFirecrawl(params: {
  query: string;
  apiKey: string;
  maxResults?: number;
}): Promise<WebSearchResult> {
  const { query, apiKey, maxResults = 5 } = params;

  const res = await fetch(FIRECRAWL_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      limit: maxResults,
      scrapeOptions: { formats: ['markdown'] },
    }),
  });

  // ... parse response, map to WebSearchResult
}
```

### 4.2 New Capability: URL-as-Input (Firecrawl Scrape)

Add alternative to PDF upload — user pastes a URL, Firecrawl scrapes it to markdown.

**New files:**
- `app/api/scrape-url/route.ts` — calls Firecrawl scrape endpoint
- Frontend: URL input field alongside PDF upload on landing page

### 4.3 Firecrawl as ElevenAgent Tool

Configure as a `clientTool` so the voice teacher can search the web mid-conversation:
```typescript
clientTools: {
  searchWeb: async ({ query }) => {
    const res = await fetch('/api/web-search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    return data.context;
  },
}
```

### 4.4 New dependencies

```
pnpm add @mendable/firecrawl-js
```

### 4.5 New env vars

```env
FIRECRAWL_API_KEY=fc-xxx   # Replaces TAVILY_API_KEY
```

---

## 5. ElevenLabs Integration

### 5.1 ElevenLabs TTS Provider (simple — codebase already scaffolded)

The codebase has commented-out ElevenLabs TTS code in `lib/audio/types.ts` and a full example in `lib/audio/tts-providers.ts` comments.

#### Files to modify:

| File | Change |
|---|---|
| `lib/audio/types.ts:80-85` | Add `'elevenlabs-tts'` to `TTSProviderId` union |
| `lib/audio/constants.ts` | Add `'elevenlabs-tts'` entry to `TTS_PROVIDERS` with English + Hindi voices |
| `lib/audio/tts-providers.ts` | Add `case 'elevenlabs-tts': return generateElevenLabsTTS(config, text)` + implementation |
| `lib/server/provider-config.ts` | Add `TTS_ELEVENLABS` to `TTS_ENV_MAP` |

### 5.2 ElevenAgents — Voice-Interactive Classroom (CORE FEATURE)

This is the centerpiece differentiator. Replace text-based multi-agent chat with real-time voice conversations.

#### Architecture:

```
User speaks into mic
       ↓
@elevenlabs/react useConversation hook (WebRTC)
       ↓
ElevenLabs Agent (cloud) — processes speech, generates response
       ↓
clientTools callbacks → Firecrawl search, slide navigation, whiteboard
       ↓
Voice response streamed back in real-time
```

#### New files:

| File | Purpose |
|---|---|
| `app/api/elevenlabs/signed-url/route.ts` | Server-side signed URL generation for secure agent connection |
| `components/agent/voice-agent.tsx` | Main voice agent UI component using `useConversation` |
| `components/agent/voice-agent-panel.tsx` | Panel integrating voice agent into classroom layout |
| `lib/elevenlabs/client-tools.ts` | Client tool definitions (searchWeb, navigateSlide, drawWhiteboard, showQuiz) |
| `lib/elevenlabs/agent-config.ts` | Agent overrides per persona (teacher voice, assistant voice, etc.) |

#### Key integration — `components/agent/voice-agent.tsx`:

```tsx
'use client';
import { useConversation } from '@elevenlabs/react';
import { useStageStore } from '@/lib/store/stage';
import { clientTools } from '@/lib/elevenlabs/client-tools';

export function VoiceAgent({ agentId, persona }) {
  const conversation = useConversation({
    clientTools,
    overrides: {
      agent: {
        prompt: { prompt: persona },
        language: 'en',
      },
      tts: { voiceId: persona.voiceId },
    },
    onMessage: (msg) => { /* update chat transcript */ },
    onModeChange: (mode) => { /* update speaking indicator */ },
  });

  const startSession = async () => {
    const res = await fetch('/api/elevenlabs/signed-url');
    const { signedUrl } = await res.json();
    await conversation.startSession({ signedUrl });
  };

  // sendContextualUpdate when slide changes
  useEffect(() => {
    if (conversation.status === 'connected') {
      const scene = useStageStore.getState().currentScene;
      conversation.sendContextualUpdate(`Now viewing: ${scene?.title}`);
    }
  }, [currentSceneId]);
}
```

#### Client tools wiring — `lib/elevenlabs/client-tools.ts`:

```typescript
export const clientTools = {
  searchWeb: async ({ query }: { query: string }) => {
    const res = await fetch('/api/web-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    return data.context;
  },

  navigateSlide: async ({ direction }: { direction: 'next' | 'prev' | number }) => {
    const store = useStageStore.getState();
    if (direction === 'next') store.nextScene();
    else if (direction === 'prev') store.prevScene();
    else store.setCurrentSceneIndex(direction);
    return `Navigated to slide`;
  },

  drawOnWhiteboard: async ({ text, x, y }: { text: string; x: number; y: number }) => {
    // Dispatch whiteboard action via store
    return 'Drawing complete';
  },
};
```

#### New dependencies:

```
pnpm add @elevenlabs/react @elevenlabs/client elevenlabs
```

#### New env vars:

```env
ELEVENLABS_API_KEY=your-key
ELEVENLABS_AGENT_ID=your-agent-id
```

#### ElevenLabs Dashboard Setup:
1. Create agent with system prompt for "Lead Tutor"
2. Configure voice (Rachel, Drew, etc.)
3. Add custom tools matching `clientTools` schema
4. Enable Firecrawl webhook tool pointing to `/api/web-search`

### 5.3 Dual Mode: Voice + Text

Keep the existing LangGraph text-based chat as a fallback. Users can toggle:
- **Voice Mode** — ElevenAgents (real-time voice via WebRTC)
- **Text Mode** — LangGraph multi-agent chat (existing SSE streaming)

Add toggle in classroom UI header.

---

## 6. Backend Infrastructure (NEW)

### 6.1 Architecture Decision

**Approach:** Add backend capabilities directly into the existing Next.js app using:
- **NextAuth.js v5** for authentication (works natively with Next.js App Router)
- **PostgreSQL + Prisma** for database (users, courses, usage tracking)
- **Redis (Upstash or self-hosted)** for sessions, rate limiting, caching
- **Next.js Middleware** for route protection and rate limiting

**Rationale:** A separate Express/Hono backend would require rewriting all 15+ API routes, managing CORS, deploying two services, and syncing auth state between them — unnecessary complexity for a hackathon. Next.js middleware + server actions can handle auth, rate limiting, and DB access cleanly within the existing architecture.

### 6.2 Database Schema (PostgreSQL + Prisma)

New file: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)

  accounts      Account[]
  sessions      Session[]
  courses       Course[]
  apiKeys       ApiKey[]
  usageLogs     UsageLog[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Course {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  stageData   Json
  scenes      Json?
  metadata    Json?
  isPublic    Boolean  @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ApiKey {
  id        String   @id @default(cuid())
  userId    String
  name      String
  key       String   @unique
  lastUsed  DateTime?
  expiresAt DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

model UsageLog {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String
  tokens    Int?
  credits   Int?
  model     String?
  duration  Int?
  status    Int

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

enum Role {
  USER
  ADMIN
}
```

### 6.3 Authentication (NextAuth.js v5)

New file: `lib/auth.ts`

```typescript
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }),
    GitHub({ clientId: process.env.GITHUB_CLIENT_ID!, clientSecret: process.env.GITHUB_CLIENT_SECRET! }),
    Credentials({ /* email + password */ }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login', signUp: '/auth/register' },
});
```

New files:
| File | Purpose |
|---|---|
| `lib/auth.ts` | NextAuth v5 config |
| `lib/db.ts` | Prisma client singleton |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth API route handler |
| `app/auth/login/page.tsx` | Login page (Google, GitHub, Email) |
| `app/auth/register/page.tsx` | Registration page |
| `components/auth/login-form.tsx` | Login form component |
| `components/auth/user-menu.tsx` | Authenticated user dropdown |
| `middleware.ts` | Next.js middleware for route protection |

### 6.4 Redis Integration

**Provider:** Upstash Redis (serverless, works with Next.js edge runtime) OR self-hosted via Docker

New file: `lib/redis.ts`

```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

**Uses:**
1. **Rate limiting** — per-user, per-endpoint sliding window
2. **Session caching** — faster session lookups than DB
3. **Generation queue** — track in-progress generation jobs
4. **API key validation cache** — cache user API key lookups

### 6.5 Rate Limiting

New file: `lib/rate-limit.ts`

```typescript
import { redis } from '@/lib/redis';

export async function rateLimit(
  identifier: string,
  endpoint: string,
  limit: number,
  window: number,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `rate:${endpoint}:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - window;

  const pipe = redis.pipeline();
  pipe.zremrangebyscore(key, 0, windowStart);
  pipe.zadd(key, { score: now, member: `${now}:${Math.random()}` });
  pipe.zcard(key);
  pipe.expire(key, window);
  const results = await pipe.exec();

  const count = results[2] as number;
  const remaining = Math.max(0, limit - count);
  const success = count <= limit;

  return { success, remaining, reset: now + window };
}
```

**Rate limits by endpoint:**

| Endpoint | Limit | Window |
|---|---|---|
| `/api/chat` | 30 req | 1 minute |
| `/api/generate/*` | 10 req | 1 minute |
| `/api/web-search` | 20 req | 1 minute |
| `/api/generate/image` | 5 req | 1 minute |
| `/api/generate/video` | 3 req | 5 minutes |
| `/api/elevenlabs/*` | 10 req | 1 minute |
| `/api/auth/*` | 5 req | 1 minute |

### 6.6 Middleware (Route Protection + Rate Limiting)

New file: `middleware.ts`

```typescript
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const PROTECTED_ROUTES = ['/classroom', '/api/chat', '/api/generate', '/api/web-search', '/api/elevenlabs'];
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/api/auth', '/api/health'];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return;

  if (!req.auth && PROTECTED_ROUTES.some(r => pathname.startsWith(r))) {
    return Response.redirect(new URL('/auth/login', req.url));
  }

  if (pathname.startsWith('/api/') && req.auth?.user?.id) {
    const { success, remaining } = await rateLimit(req.auth.user.id, pathname, 30, 60);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'X-RateLimit-Remaining': remaining.toString() },
      });
    }
  }
});
```

### 6.7 Usage Tracking

New file: `lib/server/usage-tracker.ts`

```typescript
import { prisma } from '@/lib/db';

export async function trackUsage(params: {
  userId: string;
  endpoint: string;
  tokens?: number;
  model?: string;
  duration: number;
  status: number;
}) {
  await prisma.usageLog.create({ data: params });
}
```

### 6.8 Course Persistence (Server-side)

Currently courses live only in client-side IndexedDB. Add server-side persistence:

- On course generation complete → save to PostgreSQL via `/api/courses` endpoint
- On classroom load → try server first, fall back to IndexedDB (existing behavior)
- Users can see "My Courses" dashboard after login

New files:
| File | Purpose |
|---|---|
| `app/api/courses/route.ts` | CRUD for courses |
| `app/api/courses/[id]/route.ts` | Get/update/delete specific course |
| `app/dashboard/page.tsx` | User's course dashboard |

### 6.9 Docker Compose Update

```yaml
services:
  kakshai:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: kakshai
      POSTGRES_USER: kakshai
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  postgres-data:
  redis-data:
```

### 6.10 New Environment Variables

```env
# Database
DATABASE_URL=postgresql://kakshai:changeme@localhost:5432/kakshai

# Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
# OR for self-hosted:
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_SECRET=generate-a-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# ElevenLabs
ELEVENLABS_API_KEY=xxx
ELEVENLABS_AGENT_ID=xxx

# Firecrawl (replaces TAVILY_API_KEY)
FIRECRAWL_API_KEY=fc-xxx
```

### 6.11 New Dependencies

```
pnpm add next-auth@beta @auth/prisma-adapter prisma @prisma/client
pnpm add @upstash/redis @upstash/ratelimit
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

---

## 7. Implementation Order (Priority for Hackathon)

Given the 5-day deadline, the order is:

### Phase 1: Foundations (Day 1)
1. Rebrand: rename package, update metadata, layout title
2. i18n: flip default to en-US, replace zh-CN with hi-IN
3. Remove Chinese providers (LLM, TTS, ASR, Image, Video)
4. Fix hardcoded Chinese strings

### Phase 2: Core Integrations (Day 2-3)
5. Firecrawl Search: replace Tavily implementation
6. Firecrawl Scrape: add URL-as-input feature
7. ElevenLabs TTS: add as new TTS provider
8. ElevenAgents: implement voice classroom (the star feature)
9. Wire client tools (Firecrawl search + slide nav + whiteboard)

### Phase 3: Backend (Day 3-4)
10. PostgreSQL + Prisma schema + migrations
11. Redis setup
12. NextAuth.js v5 (Google + GitHub + email login)
13. Rate limiting middleware
14. Usage tracking
15. Course persistence (server-side save)
16. Protected routes + middleware

### Phase 4: Polish (Day 5)
17. Dashboard page (my courses)
18. Auth UI (login/register pages)
19. Docker compose update
20. Record demo video for hackathon submission

---

## 8. Critical Files Summary

### Files to DELETE:
- `README-zh.md`
- `lib/web-search/tavily.ts` (replaced by firecrawl.ts)
- `lib/media/adapters/seedream-adapter.ts`
- `lib/media/adapters/qwen-image-adapter.ts`
- `lib/media/adapters/seedance-adapter.ts`
- `lib/media/adapters/kling-adapter.ts`

### Files to CREATE:
- `prisma/schema.prisma`
- `lib/auth.ts`
- `lib/db.ts`
- `lib/redis.ts`
- `lib/rate-limit.ts`
- `lib/server/usage-tracker.ts`
- `lib/web-search/firecrawl.ts`
- `lib/elevenlabs/client-tools.ts`
- `lib/elevenlabs/agent-config.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/elevenlabs/signed-url/route.ts`
- `app/api/scrape-url/route.ts`
- `app/api/courses/route.ts`
- `app/api/courses/[id]/route.ts`
- `app/auth/login/page.tsx`
- `app/auth/register/page.tsx`
- `app/dashboard/page.tsx`
- `components/agent/voice-agent.tsx`
- `components/agent/voice-agent-panel.tsx`
- `components/auth/login-form.tsx`
- `components/auth/user-menu.tsx`
- `middleware.ts`

### Files to MODIFY (heavy):
- `package.json` — name + new deps
- `app/layout.tsx` — metadata + auth provider wrapping
- `lib/i18n/*` — all 7 files
- `lib/hooks/use-i18n.tsx`
- `lib/audio/types.ts`, `constants.ts`, `tts-providers.ts`
- `lib/ai/providers.ts`, `lib/types/provider.ts`
- `lib/server/provider-config.ts`
- `lib/orchestration/registry/store.ts`
- `lib/media/types.ts`
- `app/api/web-search/route.ts`
- `docker-compose.yml`
- `Dockerfile`

---

## 9. Verification Plan

### Smoke Tests:
1. `pnpm dev` starts without errors
2. Landing page shows "KakshAI" branding, English default
3. Language toggle switches to Hindi
4. No Chinese text visible anywhere in UI
5. Settings panel shows only international providers (OpenAI, Anthropic, Google)
6. TTS settings show OpenAI, Azure, ElevenLabs, Browser Native (no GLM/Qwen)

### Integration Tests:
7. Web search with Firecrawl returns results
8. URL scrape returns markdown content
9. ElevenLabs TTS generates audio
10. ElevenAgents voice session connects, agent speaks, user can respond
11. Voice agent can call Firecrawl search tool and read results
12. Voice agent can navigate slides via clientTool

### Backend Tests:
13. `npx prisma migrate dev` runs successfully
14. Google/GitHub OAuth login works
15. Protected routes redirect unauthenticated users
16. Rate limiting returns 429 after threshold
17. Course save/load from PostgreSQL works
18. Redis connection healthy

### End-to-End:
19. Full flow: Login → Upload PDF → Generate course → Enter classroom → Voice conversation with teacher → Teacher searches web via Firecrawl → Teacher navigates slides → Export PPTX

---

## 10. Task Tracker

| # | Task | Phase | Status |
|---|---|---|---|
| 1 | Rebrand package.json, layout.tsx, docker-compose.yml | Phase 1 | Pending |
| 2 | Overhaul i18n system (zh-CN → hi-IN, default en-US) | Phase 1 | Pending |
| 3 | Remove Chinese-only providers (LLM, TTS, ASR, Image, Video) | Phase 1 | Pending |
| 4 | Fix hardcoded Chinese strings and agent names | Phase 1 | Pending |
| 5 | Replace Tavily with Firecrawl Search | Phase 2 | Pending |
| 6 | Add Firecrawl Scrape (URL-as-input feature) | Phase 2 | Pending |
| 7 | Add ElevenLabs TTS provider | Phase 2 | Pending |
| 8 | Implement ElevenAgents voice classroom | Phase 2 | Pending |
| 9 | Wire client tools (Firecrawl + slide nav + whiteboard) | Phase 2 | Pending |
| 10 | PostgreSQL + Prisma schema + migrations | Phase 3 | Pending |
| 11 | Redis setup (Upstash or self-hosted) | Phase 3 | Pending |
| 12 | NextAuth.js v5 (Google + GitHub + email login) | Phase 3 | Pending |
| 13 | Rate limiting middleware | Phase 3 | Pending |
| 14 | Usage tracking | Phase 3 | Pending |
| 15 | Course persistence (server-side save) | Phase 3 | Pending |
| 16 | Protected routes + middleware | Phase 3 | Pending |
| 17 | Dashboard page (my courses) | Phase 4 | Pending |
| 18 | Auth UI (login/register pages) | Phase 4 | Pending |
| 19 | Docker compose update | Phase 4 | Pending |
| 20 | Record demo video for hackathon submission | Phase 4 | Pending |
