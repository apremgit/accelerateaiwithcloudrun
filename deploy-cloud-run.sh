#!/usr/bin/env bash
set -e

# Deployment script for PAI Cognitive OS to Google Cloud Run
# Accelerate AI with Cloud Run Challenge
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project)}"
REGION="us-central1"
SERVICE_NAME="pai-companion"

echo "==> Deploying $SERVICE_NAME to Google Cloud Run in $REGION (Project: $PROJECT_ID)..."

# Ensure Cloud Run and Secret Manager APIs are enabled
gcloud services enable run.googleapis.com secretmanager.googleapis.com cloudbuild.googleapis.com

# Build and Deploy via Cloud Build
gcloud builds submit --config=cloudbuild.yaml .

echo "==> Deployment complete! Verification URL:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)'
