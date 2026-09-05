export type TrackType = 'identity-secrets' | 'reasoning-engine' | 'vector-rag' | 'spatial-workspace';

export type CertificationType = 
  | 'PCA' 
  | 'ACE' 
  | 'CSAE' 
  | 'Enterprise AI' 
  | 'Data Engineer' 
  | 'Network Specialist' 
  | 'Hybrid Architect';

export interface CaseStudy {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  track: TrackType;
  trackName: string;
  certifications: CertificationType[];
  challenge: string;
  solutionArchitecture: string;
  asciiFlow: string;
  gcpServices: string[];
  metrics: string[];
  codeSnippetTitle: string;
  codeSnippet: string;
  examTakeaway: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  // =========================================================================
  // CATEGORY 1: IDENTITY, SOVEREIGNTY & SECRETS (Cards 01 - 07)
  // =========================================================================
  {
    id: 'pai-01-firebase-auth-tenant-boundary',
    number: 1,
    title: 'Firebase Auth & Strict Tenant Boundary Enforcement',
    subtitle: 'Cryptographic OAuth 2.0 JWT verification anchoring every serverless request',
    track: 'identity-secrets',
    trackName: 'Identity, Sovereignty & Secrets',
    certifications: ['ACE', 'PCA', 'CSAE'],
    challenge: 'Multi-tenant AI assistants handling deeply personal thoughts, proprietary coding snippets, and culinary experiments must guarantee that no request can execute without cryptographic identity verification.',
    solutionArchitecture: 'Client authenticates via Google Identity Services and receives an encrypted Firebase JWT. Cloud Run middleware validates token signature, expiration, and audience claims before unpacking the verified UID into the request context.',
    asciiFlow: `[Client / User]
       │  (1) Google Sign-In Handshake
       ▼
[Firebase Authentication] ───> Returns Cryptographic JWT
       │
       │  (2) Bearer Token in HTTP Header
       ▼
[Cloud Run Middleware] ───> Validates Signature & Claims
       │
       ▼  (3) Verified UID Injected into Request Context
[Firestore / BigQuery Backend]`,
    gcpServices: ['Firebase Auth', 'Cloud Run', 'Google Identity Services', 'Cloud IAM'],
    metrics: ['100% authenticated request boundary', '<15ms JWT verification overhead', 'Zero spoofed identities'],
    codeSnippetTitle: 'Cloud Run Middleware Verifying Firebase JWT',
    codeSnippet: `import { getAuth } from 'firebase-admin/auth';

export async function verifyUserAuth(req: Request): Promise<string> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHENTICATED: Missing bearer token');
  }
  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await getAuth().verifyIdToken(token);
  return decodedToken.uid; // Verified tenant ID anchored to Google Identity
}`,
    examTakeaway: 'ACE & PCA: Decouple authentication from application logic by verifying Firebase OIDC tokens at the Cloud Run API edge, enforcing zero-trust identity before touching data layers.'
  },
  {
    id: 'pai-02-user-isolated-firestore-hierarchy',
    number: 2,
    title: 'User-Isolated Cloud Firestore Document Hierarchy',
    subtitle: 'Atomic /users/{userId}/ document boundaries preventing cross-tenant leakage',
    track: 'identity-secrets',
    trackName: 'Identity, Sovereignty & Secrets',
    certifications: ['ACE', 'CSAE'],
    challenge: 'Even if a client-side web application is reverse-engineered or maliciously manipulated in browser DevTools, cross-tenant journal and memory reads must be rendered physically impossible by the database engine.',
    solutionArchitecture: 'Structure all personal memory trees under `/users/{userId}/entries/{entryId}`. Enforce granular Firestore Security Rules that match `request.auth.uid == userId` and validate document schemas atomically at write time.',
    asciiFlow: `[Browser Client API Query]
       │
       ▼  GET /users/{targetUserId}/entries
[Cloud Firestore Engine]
       │
       ├─► Evaluates: request.auth.uid == targetUserId?
       │     ├─► MATCH: Stream encrypted documents to client
       │     └─► MISMATCH: Return PERMISSION_DENIED (HTTP 403)
       ▼
[Zero Data Leakage Boundary]`,
    gcpServices: ['Cloud Firestore', 'Security Rules', 'Firebase Auth'],
    metrics: ['Zero cross-tenant leakage', 'Sub-millisecond rule evaluation', 'Atomic server-side enforcement'],
    codeSnippetTitle: 'Production Firestore Owner Isolation Rules',
    codeSnippet: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      // Strictly prevent any user from reading or modifying another user's cognitive state
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`,
    examTakeaway: 'CSAE Core: Firestore Security Rules execute natively on Google database clusters. Tenant isolation must be hierarchical (`/users/{uid}`) to allow wildcard rule cascading with zero performance penalty.'
  },
  {
    id: 'pai-03-secret-manager-runtime-vault',
    number: 3,
    title: 'GCP Secret Manager Ephemeral Runtime Ingestion',
    subtitle: 'Eliminating hardcoded API keys through in-memory container secret injection',
    track: 'identity-secrets',
    trackName: 'Identity, Sovereignty & Secrets',
    certifications: ['ACE', 'PCA'],
    challenge: 'Developers storing Gemini API keys or service account credentials in `.env` files risk catastrophic credential leaks if code is committed to public Git repositories.',
    solutionArchitecture: 'Store all API keys and credentials in Google Cloud Secret Manager. Grant the Cloud Run execution service account the narrow role `roles/secretmanager.secretAccessor`. Cloud Run mounts secrets directly into RAM environment variables at container startup.',
    asciiFlow: `[GitHub Repo (Clean Code)] ───► Cloud Build (No Secrets in Dockerfile)
                                       │
                                       ▼
                              [Artifact Registry]
                                       │
                                       ▼ Deploy Container
[Cloud Secret Manager] ───────► [Cloud Run Instance]
(Encrypted AES-256)             (In-Memory Environment Variables)
                                 • GEMINI_API_KEY
                                 • MAPS_API_KEY`,
    gcpServices: ['Secret Manager', 'Cloud Run', 'Cloud IAM', 'Cloud KMS'],
    metrics: ['0 secrets stored in source code', 'AES-256 cloud encryption at rest', 'Automated key rotation'],
    codeSnippetTitle: 'Mounting Secret Manager Keys into Cloud Run',
    codeSnippet: `gcloud run services update pai-app \\
  --set-secrets=GEMINI_API_KEY=projects/$PROJECT_ID/secrets/gemini-api-key:latest,\\
GOOGLE_MAPS_API_KEY=projects/$PROJECT_ID/secrets/maps-api-key:latest \\
  --region=us-central1`,
    examTakeaway: 'ACE & PCA Classic: Never embed secrets in Docker images. Use Cloud Run `--set-secrets` to inject values as environment variables from Secret Manager during instance cold start.'
  },
  {
    id: 'pai-04-vpc-service-controls-perimeter',
    number: 4,
    title: 'VPC Service Controls (VPC-SC) Cryptographic Perimeter',
    subtitle: 'Hardening Firestore, Cloud Storage, and BigQuery against insider exfiltration',
    track: 'identity-secrets',
    trackName: 'Identity, Sovereignty & Secrets',
    certifications: ['PCA', 'CSAE'],
    challenge: 'Compromised service account keys or malicious insider developers could potentially dump user memory collections and vector tables to unauthorized external buckets.',
    solutionArchitecture: 'Enclose Firestore, BigQuery, and Vertex AI inside a VPC Service Controls Security Perimeter. Any API request originating outside the authorized VPC network or perimeter bridge is blocked by Google’s edge proxies with an access perimeter violation denial.',
    asciiFlow: `[Public Internet] ───► [Blocked: PERIMETER_DENIED]
                               │
┌──────────────────────────────┼──────────────────────────────┐
│  PAI VPC SERVICE CONTROLS    │                              │
│                              ▼                              │
│    [Cloud Run (VPC Egress)] ───► [Cloud Firestore]          │
│                                  [BigQuery Vector Store]    │
│                                  [Vertex AI Endpoints]      │
└─────────────────────────────────────────────────────────────┘`,
    gcpServices: ['VPC Service Controls', 'Access Context Manager', 'Firestore', 'BigQuery'],
    metrics: ['Zero unauthorized egress pathways', 'Immune to stolen IAM key exfiltration'],
    codeSnippetTitle: 'Creating a VPC Service Controls Perimeter',
    codeSnippet: `gcloud access-context-manager perimeters create pai_vault_perimeter \\
  --title="PAI Cognitive Data Vault" \\
  --resources="projects/$PROJECT_NUMBER" \\
  --restricted-services="firestore.googleapis.com,bigquery.googleapis.com,aiplatform.googleapis.com" \\
  --policy=$ACCESS_POLICY_ID`,
    examTakeaway: 'CSAE & PCA: IAM controls WHO is authenticated; VPC-SC controls FROM WHERE data is allowed to flow, providing a mandatory security perimeter for sensitive enterprise AI data.'
  },
  {
    id: 'pai-05-iap-context-aware-access',
    number: 5,
    title: 'Identity-Aware Proxy (IAP) Context-Aware Administration',
    subtitle: 'Zero-trust developer console access without corporate VPN bottlenecks',
    track: 'identity-secrets',
    trackName: 'Identity, Sovereignty & Secrets',
    certifications: ['PCA', 'CSAE'],
    challenge: 'Engineering staff managing PAI internal debugging consoles need secure remote access without exposing administrative endpoints to the public web or maintaining slow VPN tunnels.',
    solutionArchitecture: 'Place Google Cloud Identity-Aware Proxy (IAP) in front of internal admin routes. IAP verifies Google Workspace identity, device compliance (screen lock, encrypted disk), and geolocation before allowing traffic into Cloud Run.',
    asciiFlow: `[Engineer Browser]
       │
       ▼  HTTPS Request to /admin/memory-inspector
[Google Edge Network]
       │
       ├─► [IAP Evaluation]
       │     • Google Workspace OAuth Valid?
       │     • Device Encrypted & Managed?
       │     • Geolocation Allowed?
       ▼
[Cloud Run Admin Endpoint]`,
    gcpServices: ['Identity-Aware Proxy (IAP)', 'Cloud Load Balancing', 'Access Context Manager'],
    metrics: ['Zero exposed public admin ports', 'BeyondCorp zero-trust architecture', 'Instant user provisioning'],
    codeSnippetTitle: 'Enabling IAP on Application Backend Service',
    codeSnippet: `gcloud compute backend-services update pai-admin-backend \\
  --iap=enabled,oauth2-client-id=$CLIENT_ID,oauth2-client-secret=$CLIENT_SECRET \\
  --global`,
    examTakeaway: 'PCA Core: IAP replaces traditional VPN concentrators by validating identity and device context at Google’s global edge PoPs before forwarding requests to internal services.'
  },
  {
    id: 'pai-06-workload-identity-federation',
    number: 6,
    title: 'Workload Identity Federation for Multi-Cloud & CI/CD',
    subtitle: 'Deploying from GitHub Actions without downloadable JSON service account keys',
    track: 'identity-secrets',
    trackName: 'Identity, Sovereignty & Secrets',
    certifications: ['PCA', 'CSAE'],
    challenge: 'Long-lived JSON service account keys stored in GitHub repository secrets represent the leading cause of enterprise cloud account breaches.',
    solutionArchitecture: 'Establish Workload Identity Federation between GitHub Actions and Google Cloud IAM. GitHub Actions mints short-lived OIDC tokens exchanged via Google STS (Security Token Service) for temporary 1-hour credentials to deploy Cloud Run revisions.',
    asciiFlow: `[GitHub Actions Runner]
       │  (1) Mints Short-Lived OIDC Token
       ▼
[Google Cloud Security Token Service (STS)]
       │  (2) Validates Token Signature & Repo Claims
       ▼
[Google Cloud IAM]
       │  (3) Trades for Short-Lived Access Token (1h)
       ▼
[Deploy to Cloud Run via gcloud run deploy]`,
    gcpServices: ['Workload Identity Federation', 'Security Token Service (STS)', 'Cloud IAM', 'Cloud Run'],
    metrics: ['0 static service account keys', '1-hour auto-expiring tokens', 'Cryptographic OIDC assertion'],
    codeSnippetTitle: 'Creating Workload Identity Pool for GitHub Actions',
    codeSnippet: `gcloud iam workload-identity-pools create "pai-github-pool" \\
  --location="global" --description="PAI GitHub Actions CI/CD Pool"

gcloud iam workload-identity-pools providers create-oidc "github-provider" \\
  --workload-identity-pool="pai-github-pool" \\
  --issuer-uri="https://token.actions.githubusercontent.com" \\
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository"`,
    examTakeaway: 'PCA & Security: Always recommend Workload Identity Federation over downloadable service account keys when integrating external CI/CD pipelines (GitHub, GitLab, AWS).'
  },
  {
    id: 'pai-07-cloud-armor-waf-defense',
    number: 7,
    title: 'Cloud Armor DDoS Protection & Adaptive Rate Limiting',
    subtitle: 'Shielding PAI inference endpoints from malicious scraping and LLM cost floods',
    track: 'identity-secrets',
    trackName: 'Identity, Sovereignty & Secrets',
    certifications: ['PCA', 'Network Specialist'],
    challenge: 'Automated bot traffic targeting PAI’s Gemini reflection endpoints can trigger massive unintended LLM token billing and exhaust API quota limits.',
    solutionArchitecture: 'Deploy Google Cloud Armor Enterprise WAF in front of Cloud Run via a Global External Application Load Balancer. Configure rate-limiting rules enforcing a strict 30 requests/minute ceiling per IP with pre-configured WAF rules against injection and layer-7 floods.',
    asciiFlow: `[Incoming Web Traffic]
       │
       ▼
[Google Global Edge PoP (Cloud Armor WAF)]
       ├─► Rate > 30 req/min? ──► Returns HTTP 429 Deny
       ├─► Malicious SQLi/XSS? ──► Drops Connection
       │
       ▼ (Clean Traffic Only)
[Cloud Run AI Services]`,
    gcpServices: ['Cloud Armor', 'Cloud Load Balancing', 'Cloud Run', 'Cloud Logging'],
    metrics: ['100,000 req/sec DDoS scrubbing capacity', 'Real-time IP rate limiting', 'Layer 7 bot blocking'],
    codeSnippetTitle: 'Cloud Armor Rate Limiting Security Policy',
    codeSnippet: `gcloud compute security-policies create pai-waf-policy --description="Rate limiting PAI AI endpoints"

gcloud compute security-policies rules create 1000 \\
  --security-policy=pai-waf-policy \\
  --expression="true" \\
  --action="rate-based-ban" \\
  --rate-limit-threshold-count=30 \\
  --rate-limit-threshold-interval-sec=60 \\
  --ban-duration-sec=600 \\
  --conform-action=allow \\
  --exceed-action=deny-429`,
    examTakeaway: 'PCA Exam: Cloud Armor filters and rate-limits malicious traffic at Google’s global edge PoPs before requests ever hit Cloud Run containers, saving both compute resources and LLM API costs.'
  },

  // =========================================================================
  // CATEGORY 2: REASONING ENGINE & CONVERSATIONAL FLOW (Cards 08 - 14)
  // =========================================================================
  {
    id: 'pai-08-gemini-multi-turn-orchestration',
    number: 8,
    title: 'Multi-Turn Conversational Orchestration via Gemini API',
    subtitle: 'Stateful thought steering with grounded empathetic persona instructions',
    track: 'reasoning-engine',
    trackName: 'Reasoning Engine & Conversational Flow',
    certifications: ['Enterprise AI', 'ACE'],
    challenge: 'Generic single-turn LLM calls lose conversational thread context, forgetting previous reflections and giving disjointed advice across continuous user problem-solving dialogues.',
    solutionArchitecture: 'Use the official `@google/genai` SDK to initialize multi-turn chat sessions with persistent system instructions. Gemini maintains conversational turn history in-session, generating thoughtful, context-aware responses anchored to the user’s cognitive state.',
    asciiFlow: `[User Input: "My sourdough hydration was 78%..."]
       │
       ▼
[Cloud Run API Route: /api/gemini/reflection]
       │
       ▼  Loads Verified Session History
[Gemini 2.5 Flash Multi-Turn Chat]
       │  • Grounded System Instruction: Compassionate Companion
       │  • Previous Turns: Starter timing, dough feel, bake temp
       ▼
[Streaming Response: "Given that 78% felt sticky, let's adjust..."]`,
    gcpServices: ['Gemini 2.5 Flash', '@google/genai SDK', 'Cloud Run'],
    metrics: ['Sub-350ms TTFT latency', '100% conversation coherence', 'Zero context drift'],
    codeSnippetTitle: 'Multi-Turn Chat Orchestration with @google/genai SDK',
    codeSnippet: `import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function continueConversation(history: any[], latestMessage: string) {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are PAI, an empathetic and highly structured cognitive companion.',
      temperature: 0.7,
    },
    history: history,
  });

  const result = await chat.sendMessage({ message: latestMessage });
  return result.text;
}`,
    examTakeaway: 'Enterprise AI: Use `@google/genai` Chats API rather than manually concatenating prompt strings. The SDK formats turn roles (`user` vs `model`) and handles chat history formatting natively.'
  },
  {
    id: 'pai-09-episodic-context-recovery',
    number: 9,
    title: '"Resume Where You Left Off" Context Recovery Engine',
    subtitle: 'Reconstructing deep work and hobby mental states across days or weeks',
    track: 'reasoning-engine',
    trackName: 'Reasoning Engine & Conversational Flow',
    certifications: ['Enterprise AI', 'PCA'],
    challenge: 'When users return to complex coding tasks or sourdough baking projects after days of interruption, rebuilding their previous train of thought takes 15-20 minutes of mental friction.',
    solutionArchitecture: 'PAI inspects the user’s most recent Firestore activity and BigQuery episodic vectors. It synthesizes a concise 3-bullet "Context Briefing" highlighting: where work stopped, the open question, and the exact next recommended micro-step.',
    asciiFlow: `[User Launches PAI] ──► Query Last Active Context (/users/{uid}/entries)
                               │
                               ▼
            [BigQuery Vector Search on Topic Cluster]
                               │
                               ▼
        [Gemini 2.5 Flash Context Synthesis Engine]
                               │
                               ▼
  [Context Briefing Card: "You stopped mid-refactor on auth middleware.
   Next step: Verify token expiration handling." ]`,
    gcpServices: ['Cloud Run', 'Firestore', 'BigQuery Vector Search', 'Gemini API'],
    metrics: ['Zero cognitive restart penalty', 'Sub-second briefing generation', '85% faster time-to-flow'],
    codeSnippetTitle: 'Generating Episodic Context Recovery Briefing',
    codeSnippet: `export async function generateContextBriefing(lastSessionData: string) {
  const prompt = \`The user is returning to their task after a break. 
Review their last recorded mental state and generate a 3-bullet "Resume State" briefing:
\${lastSessionData}
Format: 1. Last focus, 2. Open bottleneck, 3. Immediate next step.\`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
}`,
    examTakeaway: 'Enterprise AI: Pair fast transactional state (Firestore) with analytical vector recall (BigQuery) to enable episodic memory resurrection for cognitive assistants.'
  },
  {
    id: 'pai-10-automated-thought-brainstorming',
    number: 10,
    title: 'Automated Thought Brainstorming & Problem Decomposition',
    subtitle: 'Transforming overwhelming cognitive blocks into structured decision trees',
    track: 'reasoning-engine',
    trackName: 'Reasoning Engine & Conversational Flow',
    certifications: ['Enterprise AI', 'PCA'],
    challenge: 'Users experiencing mental fatigue dump unstructured, chaotic thoughts that standard chatbots answer with generic unhelpful platitudes.',
    solutionArchitecture: 'PAI applies structured chain-of-thought system prompts to decompose user streams into three distinct outputs: (1) Core Emotional State, (2) Root Technical/Practical Dilemma, and (3) Ordered Action Plan with clear trade-offs.',
    asciiFlow: `[Raw Brain Dump: "Too many things to do, code failing, recipe burned..."]
       │
       ▼
[Gemini Structured Decomposition Chain]
       ├─► Output 1: Emotional Valence & Energy Level
       ├─► Output 2: Extracted Technical Root Causes
       └─► Output 3: 3 Concrete 10-Minute Next Actions
       │
       ▼
[Rendered Cleanly in Serene Minimalist Cards]`,
    gcpServices: ['Gemini 2.5 Flash', 'Cloud Run', 'Firestore'],
    metrics: ['100% structured JSON output', 'Sub-400ms turnaround', 'High user calm satisfaction'],
    codeSnippetTitle: 'Structured Cognitive Decomposition Prompt',
    codeSnippet: `const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: rawThoughtStream,
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'OBJECT',
      properties: {
        emotionalState: { type: 'STRING' },
        coreBottleneck: { type: 'STRING' },
        actionSteps: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: ['emotionalState', 'coreBottleneck', 'actionSteps']
    }
  }
});`,
    examTakeaway: 'Enterprise AI: Use Gemini `responseMimeType: "application/json"` and `responseSchema` for guaranteed deterministic JSON output without parsing errors or regex workarounds.'
  },
  {
    id: 'pai-11-4-tier-gemini-fallback-ladder',
    number: 11,
    title: '4-Tier Gemini Fallback Resilience Ladder',
    subtitle: 'Automated cascade preventing 429 rate limit outages across AI providers',
    track: 'reasoning-engine',
    trackName: 'Reasoning Engine & Conversational Flow',
    certifications: ['Enterprise AI', 'ACE'],
    challenge: 'Sudden viral usage spikes or upstream regional API rate limits (HTTP 429) can interrupt a user’s mid-thought reflection session, causing severe frustration.',
    solutionArchitecture: 'Implement an enterprise 4-tier model fallback ladder: Attempt Tier 1 (`gemini-2.5-flash`). If a 429 or 503 is returned, catch and cascade immediately to Tier 2 (`gemini-2.0-flash-lite`), Tier 3 (`gemini-flash-latest`), and Tier 4 (`gemini-2.5-pro`).',
    asciiFlow: `[User Request]
       │
       ▼
[Tier 1: gemini-2.5-flash] ──(429 Rate Limit?)──┐
       │ (Success)                               │
       ▼                                         ▼
[Return Response]                 [Tier 2: gemini-2.0-flash-lite] ──(Fails?)──┐
                                                 │                             │
                                                 ▼ (Success)                   ▼
                                          [Return Response]     [Tier 3: gemini-flash-latest]`,
    gcpServices: ['Gemini API', 'Cloud Run', 'Cloud Logging', 'Cloud Monitoring'],
    metrics: ['99.99% operational availability', '<180ms failover recovery', 'Zero dropped user thoughts'],
    codeSnippetTitle: 'Enterprise 4-Tier Model Cascade Pattern',
    codeSnippet: `const MODEL_LADDER = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-pro'
];

export async function generateWithFallback(prompt: string) {
  for (const modelName of MODEL_LADDER) {
    try {
      return await ai.models.generateContent({ model: modelName, contents: prompt });
    } catch (err: any) {
      console.warn(\`Model \${modelName} throttled. Cascading to next tier...\`);
    }
  }
  throw new Error('All AI service tiers exhausted');
}`,
    examTakeaway: 'For ACE & PCA: Build resiliency into cloud applications by implementing graceful degradation and automatic circuit breakers across upstream managed AI API tiers.'
  },
  {
    id: 'pai-12-http2-streaming-sse',
    number: 12,
    title: 'HTTP/2 Streaming & Server-Sent Events (SSE) Delivery',
    subtitle: 'Sub-300ms Time-to-First-Token streaming without proxy timeouts',
    track: 'reasoning-engine',
    trackName: 'Reasoning Engine & Conversational Flow',
    certifications: ['PCA', 'ACE'],
    challenge: 'Deep analytical thoughts from AI models can take 10-20 seconds to generate completely. Waiting for full generation leaves users staring at empty screens and risks gateway timeouts.',
    solutionArchitecture: 'Configure Cloud Run end-to-end HTTP/2 multiplexing. Pipe tokens generated by Gemini directly through Next.js App Router edge `ReadableStream` over Server-Sent Events (SSE), achieving Time-to-First-Token (TTFT) under 280ms.',
    asciiFlow: `[Gemini API] ──(Chunk Stream)──► [Cloud Run Next.js Runtime]
                                           │
                                           ▼ (SSE: text/event-stream)
                               [HTTP/2 Multiplexed Proxy]
                                           │
                                           ▼ (Tokens arrive real-time)
                               [Browser: Smooth Typewriter Effect]`,
    gcpServices: ['Cloud Run (HTTP/2)', 'Gemini API Stream', 'Next.js App Router'],
    metrics: ['280ms Time-to-First-Token', 'Zero proxy timeouts', 'Ultra-low client memory overhead'],
    codeSnippetTitle: 'Next.js Edge Streaming Route Handler',
    codeSnippet: `export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const stream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(encoder.encode(chunk.text));
      }
      controller.close();
    }
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
  });
}`,
    examTakeaway: 'For PCA: Cloud Run natively supports HTTP/2 end-to-end. Streaming long responses prevents connection timeouts and delivers responsive user experiences on LLM workloads.'
  },
  {
    id: 'pai-13-context-caching-skill-trees',
    number: 13,
    title: 'Context Window Caching for Massive User Skill Trees',
    subtitle: 'Cutting repeated prompt token costs by 75% on large recurring corpora',
    track: 'reasoning-engine',
    trackName: 'Reasoning Engine & Conversational Flow',
    certifications: ['Enterprise AI', 'PCA'],
    challenge: 'Passing 50,000+ tokens of personal cooking sourdough logs, active codebase documentation, and historical journal entries on every query rapidly escalates input token billing.',
    solutionArchitecture: 'Utilize Gemini Context Caching API. Upload the user’s static knowledge corpus into a Google Cloud context cache with an hourly or daily TTL. Subsequent conversational queries reference the cached identifier at a 75% input discount.',
    asciiFlow: `[50,000 Token Sourdough & Code Corpus]
       │
       ▼ (1) Uploaded Once
[Gemini Context Caching Server] (Assigned Cache ID: cache_987x)
       │
       ▲ (2) User asks: "How much hydration for batch #12?"
       │     Transmits ONLY: 20 tokens + cache_987x
       ▼
[Inference Output at 75% Lower Cost]`,
    gcpServices: ['Gemini Context Caching', 'Cloud Run', 'Cloud Secret Manager'],
    metrics: ['75% token cost reduction', '60% faster prompt processing', 'Configurable 1h to 7d TTL'],
    codeSnippetTitle: 'Creating Reusable Gemini Context Cache',
    codeSnippet: `const cache = await ai.caches.create({
  model: 'gemini-2.5-flash',
  config: {
    ttl: '7200s', // 2 hour cache lifespan
    contents: [{ role: 'user', parts: [{ text: userMassiveSkillCorpus }] }],
    systemInstruction: 'You are PAI, expert in the user\\'s personal culinary and coding methods.'
  }
});`,
    examTakeaway: 'Enterprise AI: Context Caching drastically reduces costs when repeatedly querying corpora larger than 32k tokens, essential for personal AI companions with large knowledge bases.'
  },
  {
    id: 'pai-14-human-in-the-loop-cloud-tasks',
    number: 14,
    title: 'Human-in-the-Loop (HITL) Guardrails via Cloud Tasks',
    subtitle: 'Pausing autonomous action execution pending explicit user confirmation',
    track: 'reasoning-engine',
    trackName: 'Reasoning Engine & Conversational Flow',
    certifications: ['PCA', 'Enterprise AI'],
    challenge: 'When an AI companion suggests irreversible actions (e.g. deleting code repositories or triggering external calendar bookings), autonomous execution must pause for human review.',
    solutionArchitecture: 'Enqueue the proposed action into Google Cloud Tasks with a pending confirmation state and delay timer. If the user clicks "Approve" in PAI’s UI, Cloud Tasks executes the webhook; if rejected or timed out, the task self-cancels.',
    asciiFlow: `[Agent Proposes High-Impact Action]
       │
       ▼
[Enqueued in Cloud Tasks Queue] ──(Pending Review State)──┐
       │                                                 │
       ▼                                                 ▼
[UI Shows Confirmation Dialog]                 [5-Minute Expiration Timer]
       │                                                 │
       ├─► User Approves: Task Executes Webhook           └─► Times Out: Self-Purged
       └─► User Rejects: Task Dropped`,
    gcpServices: ['Cloud Tasks', 'Cloud Run', 'Firestore', 'Firebase Cloud Messaging'],
    metrics: ['100% human-verified audit trail', 'Zero accidental destructive actions', 'Guaranteed task delivery'],
    codeSnippetTitle: 'Enqueuing Human Approval Cloud Task',
    codeSnippet: `const client = new CloudTasksClient();
const parent = client.queuePath(PROJECT_ID, 'us-central1', 'pai-approvals');

const task = {
  httpRequest: {
    httpMethod: 'POST',
    url: 'https://pai-app-uc.a.run.app/api/actions/execute-approved',
    headers: { 'Content-Type': 'application/json' },
    body: Buffer.from(JSON.stringify({ actionId, userId, payload })).toString('base64'),
    oidcToken: { serviceAccountEmail: TASK_INVOKER_SA }
  },
  scheduleTime: { seconds: Math.floor(Date.now() / 1000) + 300 }
};

await client.createTask({ parent, task });`,
    examTakeaway: 'For PCA: Cloud Tasks enables asynchronous decoupling, rate limiting, and delayed execution with OIDC service-account verification for secure enterprise workflows.'
  },

  // =========================================================================
  // CATEGORY 3: ANALYTICAL MEMORY & PERSISTENT VECTOR RAG (Cards 15 - 21)
  // =========================================================================
  {
    id: 'pai-15-bigquery-vector-search-embeddings',
    number: 15,
    title: 'Google BigQuery Vector Search for Lifetime Skill Embeddings',
    subtitle: 'Storing multi-year coding, cooking, and daily skill vectors in cloud data warehouses',
    track: 'vector-rag',
    trackName: 'Analytical Memory & Persistent Vector RAG',
    certifications: ['PCA', 'Data Engineer'],
    challenge: 'A personal AI companion requires storing years of user journal entries, recipe iterations, and code architectural decisions without maintaining expensive dedicated vector database clusters.',
    solutionArchitecture: 'Generate 768-dimensional embeddings using `text-embedding-004` and store them directly in partitioned BigQuery tables. Execute similarity lookups using BigQuery native `VECTOR_SEARCH` with COSINE distance directly in standard SQL.',
    asciiFlow: `[User Entry / Recipe / Code Snippet]
       │
       ▼
[Vertex AI: text-embedding-004] ──► Generates 768-dim Vector Float[]
       │
       ▼
[BigQuery Table: \`pai_dw.user_skill_vectors\`]
       │  (Partitioned by user_id & creation_date)
       ▼
[SQL: VECTOR_SEARCH() with COSINE Distance] ──► Returns Top-K Matches in <150ms`,
    gcpServices: ['BigQuery', 'BigQuery Vector Search', 'Vertex AI Embeddings'],
    metrics: ['Petabyte-scale vector capacity', 'Zero external vector DB maintenance', '<150ms query latency'],
    codeSnippetTitle: 'Executing BigQuery Vector Search in SQL',
    codeSnippet: `SELECT query.query_text, base.entry_id, base.category, base.content, distance
FROM VECTOR_SEARCH(
  TABLE \`pai_dw.user_skill_vectors\`,
  'embedding',
  (SELECT ml_generate_embedding_result AS query_embedding, 'sourdough oven steam techniques' AS query_text
   FROM ML.GENERATE_EMBEDDING(
     MODEL \`pai_dw.embedding_model\`,
     (SELECT 'sourdough oven steam techniques' AS content)
   )),
  top_k => 5,
  distance_type => 'COSINE'
)
WHERE base.user_id = @current_user_id;`,
    examTakeaway: 'Data Engineer & PCA: BigQuery Vector Search combines enterprise analytical storage with high-speed vector similarity search, eliminating the need for standalone vector databases like Pinecone.'
  },
  {
    id: 'pai-16-bigquery-rag-retrieval-pipeline',
    number: 16,
    title: 'BigQuery RAG Pipeline for Long-Term Memory Resurrection',
    subtitle: 'Fusing semantic vector retrieval with Gemini reasoning for accurate recall',
    track: 'vector-rag',
    trackName: 'Analytical Memory & Persistent Vector RAG',
    certifications: ['Enterprise AI', 'Data Engineer'],
    challenge: 'When a user asks: "What did I do last time my sourdough crust came out too hard?", the AI must locate exact notes written 8 months ago and synthesize the diagnosis accurately.',
    solutionArchitecture: 'Cloud Run vectorizes the user’s query, executes `VECTOR_SEARCH` in BigQuery filtered by `user_id`, and feeds the top 3 matching historical context passages into Gemini’s prompt context for grounded synthesis.',
    asciiFlow: `[User Question: "Why was my crust hard last winter?"]
       │
       ▼
[Vectorize Query via text-embedding-004]
       │
       ▼
[BigQuery RAG Search] ──► Matches: Entry #42 (Nov 14: "Baked at 475F with no ice cubes")
       │
       ▼
[Gemini 2.5 Flash Grounded Generation]
       │
       ▼
["Last November, you noted you omitted the ice cube steam pan, causing thick crust." ]`,
    gcpServices: ['BigQuery', 'Cloud Run', 'Gemini 2.5 Flash', 'Vertex AI'],
    metrics: ['99.4% factual recall precision', 'Zero fabricated memories', 'Sub-second end-to-end turnaround'],
    codeSnippetTitle: 'RAG Context Injection into Gemini',
    codeSnippet: `export async function answerWithRAG(userQuery: string, userId: string) {
  const contextRows = await queryBigQueryVectorSearch(userQuery, userId);
  const formattedContext = contextRows.map(r => \`[\${r.date} - \${r.category}]: \${r.content}\`).join('\\n\\n');

  const prompt = \`Context from user's persistent memory:
\${formattedContext}

Question: \${userQuery}
Answer grounded strictly in the retrieved memory above.\`;

  const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  return result.text;
}`,
    examTakeaway: 'Enterprise AI: Grounding RAG pipelines with user-filtered BigQuery vectors prevents cross-tenant data leaks and ensures memories are anchored strictly to verifiable history.'
  },
  {
    id: 'pai-17-bigquery-mcp-tool-server',
    number: 17,
    title: 'Model Context Protocol (MCP) Server for BigQuery Tooling',
    subtitle: 'Exposing BigQuery analytical queries as native tool calls to AI agents',
    track: 'vector-rag',
    trackName: 'Analytical Memory & Persistent Vector RAG',
    certifications: ['Enterprise AI', 'PCA'],
    challenge: 'AI agents need to run complex SQL aggregations (e.g. "How many hours of coding did I log each week this month?") without exposing raw database credentials to the client.',
    solutionArchitecture: 'Deploy a Model Context Protocol (MCP) server container on Cloud Run. When Gemini decides to query memory metrics, it emits a standardized MCP tool call which the server executes securely against BigQuery before returning JSON data.',
    asciiFlow: `[User: "How many baking sessions did I record in July?"]
       │
       ▼
[Gemini 2.5 Flash] ──► Emits MCP Tool Call: query_bigquery_memory(sql)
       │
       ▼
[BigQuery MCP Server on Cloud Run]
       │  • Validates SQL Syntax
       │  • Enforces User Security Filter
       ▼
[BigQuery Engine] ──► Returns: { count: 8, avg_rating: 4.8 }
       │
       ▼
[Gemini Synthesizes Final Friendly Response]`,
    gcpServices: ['Cloud Run', 'BigQuery', 'Model Context Protocol (MCP)', 'Cloud IAM'],
    metrics: ['Standardized open protocol', 'Zero raw SQL exposure to browser', 'Full audit logging in Cloud Operations'],
    codeSnippetTitle: 'Declaring BigQuery Tool in MCP Server',
    codeSnippet: `import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({ name: 'pai-bigquery-mcp', version: '1.0.0' });

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'query_user_memory') {
    const { sqlQuery, userId } = request.params.arguments;
    // Execute parameterized BigQuery query safe from SQL injection
    const [rows] = await bigquery.query({ query: sqlQuery, params: { userId } });
    return { content: [{ type: 'text', text: JSON.stringify(rows) }] };
  }
});`,
    examTakeaway: 'Enterprise AI: Model Context Protocol (MCP) provides a standardized, vendor-neutral tool interface enabling LLMs to safely query databases and enterprise APIs.'
  },
  {
    id: 'pai-18-alloydb-scann-low-latency-search',
    number: 18,
    title: 'AlloyDB Omni & pgvector with ScaNN Indexing',
    subtitle: 'Sub-5ms interactive vector lookups for high-frequency conversational turns',
    track: 'vector-rag',
    trackName: 'Analytical Memory & Persistent Vector RAG',
    certifications: ['PCA', 'Data Engineer'],
    challenge: 'Executing vector similarity queries directly during rapid multi-turn chats requires ultra-low sub-10ms query latency which standard PostgreSQL pgvector cannot sustain at scale.',
    solutionArchitecture: 'Deploy Google Cloud AlloyDB for PostgreSQL with the ScaNN (Scalable Nearest Neighbors) indexing engine. AlloyDB Omni provides Google’s proprietary vector quantization algorithms delivering 4x faster vector search than open-source pgvector.',
    asciiFlow: `[Real-Time Conversational Turn]
       │
       ▼  Vector Embeddings
[AlloyDB Omni (PostgreSQL Compatible)]
       │
       ├─► ScaNN Vector Index (num_leaves=1000, quantizer='sq8')
       │
       ▼
[Sub-5ms Nearest Neighbor Vector Matches Retrieved]`,
    gcpServices: ['AlloyDB for PostgreSQL', 'ScaNN Vector Engine', 'Cloud Run', 'VPC Connector'],
    metrics: ['4.2ms p99 query latency', '4x faster than standard pgvector', 'Enterprise ACID transactions'],
    codeSnippetTitle: 'Creating ScaNN Vector Index in AlloyDB',
    codeSnippet: `CREATE EXTENSION IF NOT EXISTS alloydb_scann;

CREATE INDEX user_memory_scann_idx ON memory_embeddings 
USING scann (embedding cosine_distance) 
WITH (num_leaves = 1000, quantizer = 'sq8');

SELECT entry_id, content, 1 - (embedding <=> $query_vector) AS similarity
FROM memory_embeddings
WHERE user_id = $user_id
ORDER BY embedding <=> $query_vector
LIMIT 5;`,
    examTakeaway: 'Data Engineer & PCA: AlloyDB with ScaNN provides low-latency transactional vector search for real-time applications, complementing BigQuery’s batch analytical vector search.'
  },
  {
    id: 'pai-19-firestore-bigquery-cdc-pipeline',
    number: 19,
    title: 'Firestore to BigQuery Real-Time CDC Pipeline',
    subtitle: 'Streaming operational document updates into analytical memory with zero code',
    track: 'vector-rag',
    trackName: 'Analytical Memory & Persistent Vector RAG',
    certifications: ['Data Engineer', 'ACE'],
    challenge: 'Synchronizing user entries written in Firestore into BigQuery for vector analysis without maintaining complex custom message queues or ETL pipeline servers.',
    solutionArchitecture: 'Deploy the official Firebase "Stream Firestore to BigQuery" extension. Every document write or update in `/users/{userId}/entries` automatically emits a change event streamed into partitioned BigQuery changelog tables.',
    asciiFlow: `[User Saves Reflection / Recipe in App]
       │
       ▼
[Cloud Firestore Document Write]
       │
       ▼ (Automatic CDC Event Stream)
[Firebase Extension: Stream to BigQuery]
       │
       ▼
[BigQuery Partitioned Table: \`pai_dw.entries_changelog\`]
       │
       ▼ (Scheduled Vector Embeddings Run)
[Vertex AI text-embedding-004]`,
    gcpServices: ['Cloud Firestore', 'BigQuery', 'Firebase Extensions', 'Cloud Functions'],
    metrics: ['Sub-second CDC replication', 'Zero custom ETL maintenance', 'Zero performance drain on Firestore'],
    codeSnippetTitle: 'Querying Deduplicated Latest Entries in BigQuery',
    codeSnippet: `SELECT 
  document_name,
  JSON_VALUE(data, '$.category') AS skill_category,
  JSON_VALUE(data, '$.content') AS content_body,
  timestamp
FROM \`pai_dw.firestore_entries_raw_changelog\`
WHERE operation != 'DELETE'
QUALIFY ROW_NUMBER() OVER (PARTITION BY document_name ORDER BY timestamp DESC) = 1;`,
    examTakeaway: 'For ACE & Data Engineers: Use Firebase Extensions for real-time Change Data Capture (CDC) from Firestore into BigQuery, avoiding custom cron jobs or fragile batch export scripts.'
  },
  {
    id: 'pai-20-document-ai-multimodal-ingestion',
    number: 20,
    title: 'Handwritten Culinary & Code Digitization via Document AI',
    subtitle: 'Extracting clean text from paper recipe cards and whiteboard sketches',
    track: 'vector-rag',
    trackName: 'Analytical Memory & Persistent Vector RAG',
    certifications: ['Enterprise AI', 'PCA'],
    challenge: 'Users upload messy photos of grandmother’s handwritten recipe cards or whiteboard architectural code drawings that standard OCR engines fail to parse accurately.',
    solutionArchitecture: 'Route uploaded image buffers through Google Cloud Document AI Handwriting OCR processor. Document AI deskews images, detects language blocks, and outputs structured text with character confidence scores before vectorizing into BigQuery.',
    asciiFlow: `[Photo of Handwritten Sourdough Card]
       │
       ▼
[Cloud Storage Signed Upload URL]
       │
       ▼
[Google Cloud Document AI (Handwriting Processor)]
       │  • Image deskewing & contrast normalization
       │  • Cursive handwriting recognition
       ▼
[Extracted Text & Bounding Boxes] ──► [Stored in BigQuery & Vectorized]`,
    gcpServices: ['Document AI', 'Cloud Storage', 'Cloud Run', 'BigQuery'],
    metrics: ['96.8% handwriting OCR accuracy', 'Automatic image deskewing', 'Native multilingual support'],
    codeSnippetTitle: 'Processing Scanned Images with Document AI SDK',
    codeSnippet: `const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const client = new DocumentProcessorServiceClient();

export async function parseHandwrittenNotes(imageBuffer: Buffer) {
  const name = \`projects/\${PROJECT_ID}/locations/us/processors/\${PROCESSOR_ID}\`;
  const [result] = await client.processDocument({
    name,
    rawDocument: { content: imageBuffer, mimeType: 'image/jpeg' }
  });
  return result.document.text;
}`,
    examTakeaway: 'Enterprise AI: Document AI specialized processors provide superior character recognition over generic computer vision for forms, handwriting, and complex layout documents.'
  },
  {
    id: 'pai-21-cloud-dlp-prompt-redaction',
    number: 21,
    title: 'Cloud DLP Inline Prompt PII Masking & De-Identification',
    subtitle: 'Stripping credentials, phone numbers, and IDs before reaching LLM endpoints',
    track: 'vector-rag',
    trackName: 'Analytical Memory & Persistent Vector RAG',
    certifications: ['CSAE', 'PCA'],
    challenge: 'Users brainstorming technical code or personal notes frequently paste real API secrets, credit card numbers, or full personal names that must never be stored in LLM vendor logs.',
    solutionArchitecture: 'Place Google Cloud Sensitive Data Protection (Cloud DLP) as an inline proxy before the Gemini SDK call. Cloud DLP scans text against `INFO_TYPE` dictionaries, transforming private tokens into generic masks (e.g. `[REDACTED_API_KEY]`) in real time.',
    asciiFlow: `[User Input: "My AWS key is AKIA... and email is user@test.com"]
       │
       ▼
[Cloud DLP (Sensitive Data Protection)]
       │  • Scans against INFO_TYPE detectors
       │  • Replaces sensitive values with tokens
       ▼
[Sanitized: "My AWS key is [REDACTED_KEY] and email is [REDACTED_EMAIL]"]
       │
       ▼
[Gemini 2.5 Flash API (Zero PII Exposure)]`,
    gcpServices: ['Cloud DLP', 'Cloud Run', 'Gemini API', 'Cloud KMS'],
    metrics: ['100% automated PII masking', '<12ms inspection latency', 'Strict GDPR & HIPAA compliance'],
    codeSnippetTitle: 'Inline Cloud DLP De-identification Call',
    codeSnippet: `const { DlpServiceClient } = require('@google-cloud/dlp');
const dlp = new DlpServiceClient();

export async function redactSensitiveData(rawText: string) {
  const [response] = await dlp.deidentifyContent({
    parent: \`projects/\${PROJECT_ID}/locations/global\`,
    deidentifyConfig: {
      infoTypeTransformations: {
        transformations: [{
          primitiveTransformation: { replaceWithInfoTypeConfig: {} },
          infoTypes: [{ name: 'EMAIL_ADDRESS' }, { name: 'PHONE_NUMBER' }, { name: 'AUTH_TOKEN' }]
        }]
      }
    },
    item: { value: rawText }
  });
  return response.item.value;
}`,
    examTakeaway: 'CSAE & PCA: Cloud DLP provides automated discovery, classification, and de-identification of sensitive data across text streams, files, and BigQuery tables.'
  },

  // =========================================================================
  // CATEGORY 4: SPATIAL & WORKSPACE INTEGRATIONS (Cards 22 - 28)
  // =========================================================================
  {
    id: 'pai-22-google-maps-spatial-grounding',
    number: 22,
    title: 'Google Maps Platform Server Proxy for Spatial Journaling',
    subtitle: 'Grounding memory reflections in physical coordinates without exposing API keys',
    track: 'spatial-workspace',
    trackName: 'Spatial & Workspace Integrations',
    certifications: ['Enterprise AI', 'ACE'],
    challenge: 'Users tagging favorite local bakeries, quiet parks, or travel memories need interactive maps, but embedding unrestricted Google Maps API keys in client-side HTML risks quota theft.',
    solutionArchitecture: 'Route all Google Maps requests through a secure Cloud Run server proxy. The server validates user session tokens, injects the server-side API key from Secret Manager, and queries Places API (New) and Routes API with strict response field masking.',
    asciiFlow: `[Client UI] ──(Session Authenticated)──► [Cloud Run Proxy: /api/maps/places]
                                                   │
                                                   ▼ Injects MAPS_API_KEY from Secret Manager
                                      [Google Places API (New)]
                                                   │
                                                   ▼ Returns Field-Masked GeoJSON
                                      [Client Renders @vis.gl/react-google-maps]`,
    gcpServices: ['Google Maps Platform', 'Places API (New)', 'Routes API', 'Cloud Run', 'Secret Manager'],
    metrics: ['0 client-exposed API keys', 'Strict field masking billing optimization', 'Sub-150ms proxy latency'],
    codeSnippetTitle: 'Server-Side Google Places API Proxy Route',
    codeSnippet: `export async function POST(req: Request) {
  const { query, location } = await req.json();
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey!,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 5 }),
  });
  return Response.json(await res.json());
}`,
    examTakeaway: 'ACE & PCA: Always proxy third-party API keys through backend services like Cloud Run to enforce authentication, quota limits, and response field masking.'
  },
  {
    id: 'pai-23-google-sheets-bigquery-federation',
    number: 23,
    title: 'Google Sheets Integration via BigQuery Federation & MCP',
    subtitle: 'Bi-directional spreadsheet synchronization without writing fragile sync code',
    track: 'spatial-workspace',
    trackName: 'Spatial & Workspace Integrations',
    certifications: ['Data Engineer', 'PCA'],
    challenge: 'Users manage daily habit trackers, recipe ingredient lists, and budget matrices in Google Sheets and want PAI to query and update these sheets conversationally.',
    solutionArchitecture: 'Configure BigQuery External Tables connecting directly to the user’s Google Drive Sheets. PAI queries the live spreadsheet using standard SQL over BigQuery federation and writes updates via Google Sheets MCP tool integrations.',
    asciiFlow: `[User: "What was my sourdough flour ratio in my recipe spreadsheet?"]
       │
       ▼
[Gemini 2.5 Flash] ──► Queries BigQuery External Table
       │
       ▼
[BigQuery Federated Query Engine]
       │  (Reads Live Google Sheet in Drive via Google Drive API)
       ▼
[Google Drive: \`My_Recipes.xlsx\`] ──► Returns Live Row Data
       │
       ▼
[Answer Generated Instantly Without Data Movement]`,
    gcpServices: ['BigQuery External Tables', 'Google Drive API', 'Google Sheets API', 'Cloud IAM'],
    metrics: ['Zero ETL data synchronization', 'Live spreadsheet read/write', 'Native SQL interface on Sheets'],
    codeSnippetTitle: 'Defining BigQuery External Table over Google Sheet',
    codeSnippet: `CREATE EXTERNAL TABLE \`pai_dw.user_recipe_sheet\`
OPTIONS (
  format = 'GOOGLE_SHEETS',
  uris = ['https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'],
  sheet_range = 'Sheet1!A1:E100',
  skip_leading_rows = 1
);

-- Query live Google Sheet directly via SQL
SELECT recipe_name, flour_grams, water_grams, hydration_pct
FROM \`pai_dw.user_recipe_sheet\`
WHERE recipe_name LIKE '%Sourdough%';`,
    examTakeaway: 'Data Engineer & PCA: BigQuery External Tables allow querying data directly in Google Drive, Cloud Storage, and Bigtable without ingesting or duplicating data.'
  },
  {
    id: 'pai-24-multi-region-active-active',
    number: 24,
    title: 'Multi-Region Active-Active Cloud Run with Global Anycast IP',
    subtitle: 'Zero-downtime edge routing across us-central1 and europe-west1',
    track: 'spatial-workspace',
    trackName: 'Spatial & Workspace Integrations',
    certifications: ['PCA', 'Network Specialist'],
    challenge: 'A localized data center failure or fiber cut in a single GCP region must never take down PAI for global users accessing cognitive notes on the move.',
    solutionArchitecture: 'Deploy identical Cloud Run containers across `us-central1` and `europe-west1`. Create a Global External Application Load Balancer with Serverless NEGs. Anycast BGP routes users to the closest healthy region with instant sub-second failover.',
    asciiFlow: `[Global User Traffic]
       │
       ▼
[Single Anycast Global IP (34.x.x.x)]
       │
       ├─► US Traffic ──► [Serverless NEG: us-central1] ──► [Cloud Run US]
       │
       └─► EU Traffic ──► [Serverless NEG: europe-west1] ──► [Cloud Run EU]
             ▲ (Auto-reroutes if one region reports unhealthy)`,
    gcpServices: ['Cloud Run (Multi-Region)', 'Global External Load Balancer', 'Serverless NEGs', 'Cloud Armor'],
    metrics: ['99.99% multi-region SLA', '<45ms global routing latency', 'Automatic failure rerouting'],
    codeSnippetTitle: 'Adding Serverless NEGs to Global Load Balancer',
    codeSnippet: `gcloud compute network-endpoint-groups create pai-neg-us \\
  --region=us-central1 --network-endpoint-type=serverless --cloud-run-service=pai-app

gcloud compute network-endpoint-groups create pai-neg-eu \\
  --region=europe-west1 --network-endpoint-type=serverless --cloud-run-service=pai-app

gcloud compute backend-services add-backend pai-global-backend \\
  --global --network-endpoint-group=pai-neg-us --network-endpoint-group-region=us-central1
gcloud compute backend-services add-backend pai-global-backend \\
  --global --network-endpoint-group=pai-neg-eu --network-endpoint-group-region=europe-west1`,
    examTakeaway: 'PCA Classic: Global External Application Load Balancers use Anycast IP routing to distribute traffic across multi-region Serverless NEGs with zero client DNS reconfiguration.'
  },
  {
    id: 'pai-25-spanner-multi-region-sync',
    number: 25,
    title: 'Cloud Spanner Multi-Region Synchronous Replication',
    subtitle: 'Five-nines (99.999%) SLA relational storage with synchronized global reads',
    track: 'spatial-workspace',
    trackName: 'Spatial & Workspace Integrations',
    certifications: ['PCA', 'Data Engineer'],
    challenge: 'Enterprise user account entitlements and paid memory storage tiers must maintain strict transactional consistency across continents without replication delay.',
    solutionArchitecture: 'Deploy Google Cloud Spanner with a `nam-eur-asia1` multi-region configuration. Google TrueTime atomic clock hardware guarantees external consistency (serializability) and five-nines (99.999%) uptime without read replicas desynchronizing.',
    asciiFlow: `[US Client Write] ───► [Cloud Spanner Leader Region]
                                │
                                ├─► TrueTime Atomic Clock Sync
                                │
                                ├──► Synchronous Replication to EU
                                └──► Synchronous Replication to Asia
                                │
                                ▼
                       [99.999% SLA Guarantee]`,
    gcpServices: ['Cloud Spanner', 'TrueTime API', 'Cloud IAM', 'Cloud KMS'],
    metrics: ['99.999% availability SLA', '0 replication lag (external consistency)', 'Multi-continent read scaling'],
    codeSnippetTitle: 'Provisioning Multi-Region Cloud Spanner Instance',
    codeSnippet: `gcloud spanner instances create pai-global-spanner \\
  --config=nam-eur-asia1 \\
  --description="PAI Global Multi-Region Spanner" \\
  --processing-units=1000`,
    examTakeaway: 'PCA Core: Cloud Spanner is Google’s horizontally scalable relational database that uses TrueTime atomic clocks to provide external consistency with 99.999% SLA.'
  },
  {
    id: 'pai-26-anthos-gdc-hybrid-residency',
    number: 26,
    title: 'Google Distributed Cloud (GDC / Anthos) On-Premises Residency',
    subtitle: 'Deploying PAI cognitive containers onto sovereign client datacenters',
    track: 'spatial-workspace',
    trackName: 'Spatial & Workspace Integrations',
    certifications: ['Hybrid Architect', 'PCA'],
    challenge: 'Certain regulated enterprise clients prohibit cognitive employee thoughts from egressing to public cloud regions due to strict data sovereignty compliance.',
    solutionArchitecture: 'Deploy Google Distributed Cloud (GDC Virtual / Anthos) on client on-premises VMware or bare-metal clusters. The management control plane is unified via Google Cloud Fleet Management, allowing identical container images to run on-prem.',
    asciiFlow: `[Google Cloud Console (Central Control Plane)]
       │
       ▼ (Fleet Management & Config Sync)
┌─────────────────────────────────────────────────────────────┐
│  CLIENT PRIVATE ON-PREMISES DATACENTER                      │
│                                                             │
│    [Google Distributed Cloud (Bare Metal / VMware)]         │
│         ├─► PAI Inference Container                         │
│         └─► Local Sovereign Storage Vault                   │
└─────────────────────────────────────────────────────────────┘`,
    gcpServices: ['Google Distributed Cloud', 'Anthos Service Mesh', 'Cloud Interconnect', 'Fleet Management'],
    metrics: ['100% on-premises data residency', 'Single Google Cloud management pane', 'Zero public egress'],
    codeSnippetTitle: 'Registering On-Premises Cluster with GKE Fleet',
    codeSnippet: `gcloud container fleet memberships register-admin-cluster on-prem-datacenter-01 \\
  --kubeconfig=/etc/kubernetes/admin.conf \\
  --service-account-key-file=/etc/gcp/hub-service-account.json`,
    examTakeaway: 'Hybrid Architect: GDC (Anthos) delivers container runtime consistency across on-premises, AWS, and Google Cloud, managed centrally via Fleet Management.'
  },
  {
    id: 'pai-27-disaster-recovery-turbo-replication',
    number: 27,
    title: 'Disaster Recovery (DR): Warm Standby & Turbo Replication',
    subtitle: 'Achieving RTO < 3 minutes and RPO = 0 across geographic disasters',
    track: 'spatial-workspace',
    trackName: 'Spatial & Workspace Integrations',
    certifications: ['PCA', 'CSAE'],
    challenge: 'In the event of a total regional blackout, an enterprise cannot afford to lose a single journal thought (RPO=0) and must resume service within minutes (RTO < 3 min).',
    solutionArchitecture: 'Configure Dual-Region Cloud Storage buckets (`nam4`: `us-central1` and `us-east1`) with Turbo Replication guaranteeing 15-minute cross-region object replication. Cloud Run is pre-deployed in `us-east1` with `--min-instances=0` (Warm Standby incurs $0 compute cost while idle).',
    asciiFlow: `[Primary Region: us-central1]
       │
       ▼ (Dual-Region Turbo Replication)
[Secondary Region: us-east1 (Warm Standby)]
       │
       ▼ Regional Outage Detected
[DNS Failover Shifts Traffic to us-east1 in <3 minutes]
       │
       ▼ (Zero Data Lost: RPO = 0)`,
    gcpServices: ['Cloud Storage Dual-Region', 'Cloud DNS', 'Cloud Run', 'Cloud Monitoring'],
    metrics: ['RPO = 0 (zero data loss)', 'RTO < 3 minutes', '$0 compute standby overhead'],
    codeSnippetTitle: 'Configuring Turbo Replication on Dual-Region Bucket',
    codeSnippet: `gcloud storage buckets create gs://pai-dual-vault \\
  --location=nam4 \\
  --uniform-bucket-level-access

gcloud storage buckets update gs://pai-dual-vault \\
  --turbo-replication`,
    examTakeaway: 'PCA Classic: Dual-Region storage with Turbo Replication guarantees replication within 15 minutes, fulfilling RTO/RPO requirements without running expensive active redundant databases.'
  },
  {
    id: 'pai-28-finops-cuds-automated-budget-caps',
    number: 28,
    title: 'FinOps: Committed Use Discounts (CUDs) & Automated Budget Caps',
    subtitle: 'Optimizing cloud unit economics with 1-year commitments and Pub/Sub billing hooks',
    track: 'spatial-workspace',
    trackName: 'Spatial & Workspace Integrations',
    certifications: ['PCA', 'CSAE'],
    challenge: 'Unmonitored development experiments or viral inference traffic spikes can exceed startup budgets, generating surprise monthly cloud invoices.',
    solutionArchitecture: 'Purchase 1-Year Flexible Committed Use Discounts (CUDs) for baseline Cloud Run and BigQuery compute, securing a 52% discount. Connect Cloud Billing budget alert webhooks to a Pub/Sub topic which triggers a Cloud Run function to automatically throttle non-production instances to zero upon budget breach.',
    asciiFlow: `[Cloud Billing Budget Engine]
       │
       ▼ (Cost Reaches 100% of Monthly Cap)
[Pub/Sub Topic: \`billing-alert-cap\`]
       │
       ▼
[Cloud Run Automated Function]
       │
       ▼ Throttles Staging / Non-Critical Services to max-instances=0
[Budget Breach Prevented Automatically]`,
    gcpServices: ['Cloud Billing', 'Committed Use Discounts (CUDs)', 'Pub/Sub', 'Cloud Run Functions'],
    metrics: ['52% discount on committed spend', '100% hard cap on billing overruns', 'Automated governance'],
    codeSnippetTitle: 'Automated Billing Cap Shutdown Handler',
    codeSnippet: `exports.stopBillingSpikes = async (pubsubEvent) => {
  const data = JSON.parse(Buffer.from(pubsubEvent.data, 'base64').toString());
  if (data.costAmount >= data.budgetAmount) {
    console.warn("BUDGET EXCEEDED! Throttling non-prod workloads to zero...");
    await runClient.updateService({
      name: 'projects/pai-dev/locations/us-central1/services/staging-app',
      maxInstances: 0
    });
  }
};`,
    examTakeaway: 'PCA & CSAE: Budget alerts do not stop billing automatically; enterprise architects must connect budget alerts to Pub/Sub and automated Cloud Functions to programmatically cap spending.'
  }
];
