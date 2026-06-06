# Pre-commit check script for Windows PowerShell
# Usage: .\scripts\pre-commit-check.ps1

Write-Host "🔍 Running pre-commit build check..." -ForegroundColor Cyan
Write-Host ""

# Run production build
npm run build

# Check if build succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful! Safe to commit." -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "❌ Build failed! Please fix errors before committing." -ForegroundColor Red
    exit 1
}

