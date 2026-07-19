#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [preview|prod]"
  echo "  preview  - create a preview deployment"
  echo "  prod     - create a production deployment"
  exit 1
}

if [ $# -ne 1 ]; then
  usage
fi

ENV="$1"
if [[ "$ENV" != "preview" && "$ENV" != "prod" && "$ENV" != "production" ]]; then
  usage
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Install it with: npm i -g vercel"
  exit 1
fi

if ! vercel whoami >/dev/null 2>&1; then
  echo "You are not logged in to Vercel. Run: vercel login" 
  exit 1
fi

# Change to this script's directory (should be frontend/ when committed)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Working directory: $PWD"

echo "Linking this local folder to a Vercel project (interactive). If already linked, this will detect the project." 
# Allow failures here so user can proceed manually if they prefer
vercel link || true

if [[ "$ENV" == "preview" ]]; then
  echo "Starting preview deployment..."
  vercel
else
  echo "Starting production deployment..."
  vercel --prod
fi

echo "Deployment finished (check output above)."

echo "Reminder: Make sure the following env vars are set in the Vercel project settings before (re)building for production:"
echo "  REACT_APP_BACKEND_URL (eg: https://your-api.example.com)"
echo "  REACT_APP_PUBLIC_WEB_URL (eg: https://your-app.vercel.app)"
echo "  REACT_APP_APPCREATOR24_APP_URL (optional)"
