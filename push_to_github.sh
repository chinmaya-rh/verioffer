#!/bin/bash
# ==============================================================================
# VeriOffer v3.1 — Automated GitHub Deployment Script
# Target Repository: https://github.com/chinmaya-rh/verioffer
# ==============================================================================

set -e

REPO_URL="https://github.com/chinmaya-rh/verioffer.git"
BRANCH="main"

echo "=========================================================="
echo "🛡️  VeriOffer — GitHub Remote Synchronization"
echo "Target: $REPO_URL (Branch: $BRANCH)"
echo "=========================================================="

# Ensure git remote is set
git remote set-url origin "$REPO_URL" 2>/dev/null || git remote add origin "$REPO_URL"

# Check if personal access token is provided via env var or argument
if [ -n "$GITHUB_TOKEN" ]; then
  echo "🔑 Using GITHUB_TOKEN environment variable..."
  AUTH_REPO_URL="https://${GITHUB_TOKEN}@github.com/chinmaya-rh/verioffer.git"
  git push "$AUTH_REPO_URL" "$BRANCH" --force
  echo "✅ Push completed successfully via GITHUB_TOKEN!"
  exit 0
fi

if [ -n "$1" ]; then
  echo "🔑 Using provided token argument..."
  AUTH_REPO_URL="https://${1}@github.com/chinmaya-rh/verioffer.git"
  git push "$AUTH_REPO_URL" "$BRANCH" --force
  echo "✅ Push completed successfully via token!"
  exit 0
fi

echo ""
echo "ℹ️  No GITHUB_TOKEN environment variable found."
echo "Attempting standard git push (will prompt for GitHub credentials or SSH key)..."
echo ""

git push origin "$BRANCH" || {
  echo ""
  echo "⚠️  Authentication required by GitHub."
  echo "To push automatically without password prompts, run:"
  echo "  GITHUB_TOKEN=your_personal_access_token ./push_to_github.sh"
  echo "Or:"
  echo "  ./push_to_github.sh your_personal_access_token"
  echo ""
  echo "Alternatively, use the standalone git bundle:"
  echo "  git clone verioffer-v3.1-repo.bundle my-repo"
  echo "  cd my-repo && git push origin main"
  exit 1
}

echo "✅ VeriOffer repository successfully pushed to GitHub!"
