# ReflectAI - Private AI Journal & Reflection Workspace

ReflectAI is a secure, user-authenticated journaling and reflective thinking application powered by Google Cloud Run, Firebase Authentication, Cloud Firestore, and the Gemini 3.6 Flash API.

Every user reflection is strictly partitioned and isolated to the authenticated user's unique Firebase UID in Cloud Firestore, protected by owner-bound security rules.

---

## 🏗️ Architecture & Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **User Identity** | Firebase Authentication | Secure Google Sign-In with federated identity (zero password handling). |
| **Backend Database** | Cloud Firestore | Isolated document storage partition (`/users/{userId}/entries/{entryId}`). |
| **AI Processing Engine** | Gemini 3.6 Flash API | Multi-turn conversational reflections, smart summaries, and brainstorming. |
| **Geospatial Grounding** | Google Maps Platform | Real-time Places API (New) & Routes API with conversational AI agent. |
| **Resilience Layer** | Gemini Fallback Ladder | Automatic graceful degradation (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`). |
| **Secret Management** | Google Secret Manager / Env Vars | Stores `GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`, and Firebase credentials securely without client leakage. |
| **Hosting & Runtime** | Google Cloud Run | Serverless, autoscaling full-stack Next.js container execution. |

---

## 🔒 Security & Firestore Rules Configuration

All user data is stored within an owner-isolated Firestore hierarchy. The database enforces strict owner-bound access rules:

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

## 🚀 Step-by-Step Deployment & Configuration Guide

### 1. Prerequisites & GCP API Enablement

Ensure the Google Cloud SDK (`gcloud`) is installed and authenticated to your project:

```bash
# Set your active GCP project
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
export REGION="us-central1"
export SERVICE_NAME="reflectai-app"

gcloud config set project $PROJECT_ID

# Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com
```

---

### 2. Secret Manager Configuration

Store your Gemini API key in Google Cloud Secret Manager and grant the Cloud Run compute service account permission to access it:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Lookup your project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')

# 3. Grant Secret Accessor role to the default Cloud Run service account
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### 3. Deploy Firestore Security Rules

Deploy the secure security rules directly using the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

---

### 4. Deploy to Google Cloud Run

Deploy the containerized Next.js application to Google Cloud Run:

```bash
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --allow-unauthenticated
```

---

### 5. Mandatory Campaign Labeling

Register and label your Cloud Run deployment for automated verification:

```bash
gcloud run services update $SERVICE_NAME \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=$REGION
```

---

## 🧪 Local Development

To run the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables in .env.local
cp .env.example .env.local
# Add your GEMINI_API_KEY in .env.local

# 3. Start development server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.
