# PAI (Personal AI Companion) — Zero-Loss Persistent Cognitive Memory

> **Architect & Developer:** [Avula Prem Kumar](https://github.com/apremgit)  
> **Repository:** [`apremgit/accelerateaiwithcloudrun`](https://github.com/apremgit/accelerateaiwithcloudrun)  
> **Campaign & Target:** Google Cloud Run AI Challenge (`dev-tutorial=cloud-run-ai-challenge`)

---

## 🌟 Executive Overview

**PAI (Personal AI Companion)** is a sovereign cognitive operating layer designed to preserve conversational state, reflective thoughts, and spatial journeys without loss. 

Engineered with **Google Cloud Run**, **Firebase Authentication**, **Cloud Firestore**, and **Google Gemini 2.5 Flash**, PAI delivers private, multi-turn AI interactions isolated to individual user tenants with zero cross-tenant leakage.

### Key Architectural Highlights
- **Serverless Scale-to-Zero Compute:** Google Cloud Run containerized execution with instantaneous concurrency scaling and zero idle costs (`--min-instances=0`).
- **Owner-Bound Tenant Isolation:** Cloud Firestore partitioned document hierarchies (`/users/{uid}/entries/{id}`) enforced cryptographically by Firebase Security Rules.
- **Multimodal AI Reasoning:** Real-time conversational reflection, thought synthesis, and automated actionable item extraction via `@google/genai` (Gemini 2.5 Flash).
- **Spatial Intelligence Grounding:** Native integration with Google Maps Platform (Places API New, Routes API) to ground memories and entries in geographic reality.
- **Zero-Secret Client Exposure:** Runtime resolution of sensitive keys (`GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`) via Google Cloud Secret Manager.
- **Automated CI/CD Verification:** Google Cloud Build multi-stage OCI container compilation, automated test verification, and zero-downtime traffic switching.

---

## 🏗️ Architectural Blueprint

```
                     ┌──────────────────────────────────────────────┐
                     │              CLIENT BROWSER (UI)             │
                     │  Next.js 15 • Tailwind CSS • Framer Motion   │
                     └──────────────────────┬───────────────────────┘
                                            │
                                  HTTPS / HTTP2 SSE
                                            │
                     ┌──────────────────────▼───────────────────────┐
                     │         GOOGLE CLOUD RUN CONTAINER           │
                     │     Serverless Runtime (Scale-to-Zero)       │
                     └───────┬──────────────┬──────────────┬────────┘
                             │              │              │
           Firebase Auth JWT │              │ Secret API   │ REST / gRPC
           Verification      │              │ Resolution   │
                             ▼              ▼              ▼
     ┌────────────────────────┐  ┌──────────────────┐  ┌────────────────────┐
     │    CLOUD FIRESTORE     │  │  SECRET MANAGER  │  │   GEMINI API &     │
     │ /users/{uid}/entries/* │  │ GEMINI_API_KEY   │  │ GOOGLE MAPS (NEW)  │
     │ Owner-Bound Sec Rules  │  │ MAPS_API_KEY     │  │ Cognitive & Spatial│
     └────────────────────────┘  └──────────────────┘  └────────────────────┘
```

---

## 🧭 Flagship Architecture & Challenge Extensions (01 — 08)

The core architecture includes the 4 foundational pillars plus the 4 challenge expansion capabilities:

1. **`01` — User Authentication**: Secure Google Sign-In with Firebase Authentication, issuing cryptographically signed JWTs verifying user identity on every request.
2. **`02` — Multi-turn AI Interaction**: Natural conversational journaling, smart synthesis, and proactive brainstorming powered by Google Gemini 2.5 Flash.
3. **`03` — Isolated Data Storage**: User-partitioned Cloud Firestore hierarchy with owner-bound rules preventing any cross-user data leakage.
4. **`04` — Secure Key Management**: Sensitive credentials injected at runtime via Google Cloud Secret Manager; no secrets stored in container images or source control.
5. **`05` — Location-Aware Entries**: Google Maps Platform (Places API New & Routes API) spatial grounding, allowing users to attach verified places and travel routes to memories.
6. **`06` — Admin Dashboard & RBAC**: Role-based access control with custom Firebase claims (`admin: true`), elevated security directives, and system audit logs.
7. **`07` — External Notifications**: Asynchronous webhook dispatching to Slack, Discord, and Email for parsed journal milestones and action items.
8. **`08` — Automated CI/CD & Verification**: Multi-stage Docker container builds, automated TypeScript/TDD test suites, and Google Cloud Build pipelines with Cloud Run health probes.

---

## 🔒 Security & Firestore Rules

All user documents are isolated to the authenticated user's unique Firebase UID:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🛠️ Local Development & Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/apremgit/accelerateaiwithcloudrun.git
cd accelerateaiwithcloudrun
npm install
```

### 2. Configure Local Environment
Create `.env.local` in the project root:
```env
# Gemini API Key (from Google AI Studio or GCP Secret Manager)
GEMINI_API_KEY="your-gemini-api-key"

# Google Maps Platform (Optional for Spatial Features)
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Firebase Client SDK Credentials
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚀 Google Cloud Run Production Deployment

### 1. Enable Required GCP APIs
```bash
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
export REGION="us-central1"
export SERVICE_NAME="pai-companion"

gcloud config set project $PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

### 2. Configure Cloud Secret Manager
```bash
# Store Gemini API Key
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant Cloud Run Secret Accessor Role
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### 4. Deploy to Cloud Run
```bash
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --min-instances=0 \
  --allow-unauthenticated
```

### 5. Challenge Mandatory Campaign Labeling
```bash
gcloud run services update $SERVICE_NAME \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=$REGION
```

---

## 👨‍💻 Author & Contact

**Avula Prem Kumar**  
- **Role:** Cloud & AI Systems Architect  
- **Email:** `avulapremkumarnaidu@gmail.com`  
- **GitHub:** [@apremgit](https://github.com/apremgit)  
- **Focus:** Google Cloud Run, Gemini Multimodal Reasoning, Serverless Scale-to-Zero, Sovereign Data Security.
