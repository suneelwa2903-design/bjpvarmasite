#!/bin/bash
# Pre-commit check script - Run production build locally before committing
# Usage: ./scripts/pre-commit-check.sh

echo "🔍 Running pre-commit build check..."
echo ""

# Run production build
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful! Safe to commit."
    exit 0
else
    echo ""
    echo "❌ Build failed! Please fix errors before committing."
    exit 1
fi

