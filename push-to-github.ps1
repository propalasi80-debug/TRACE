# Trace — create the GitHub repo and push.
# Right-click this file in the project root and choose "Run with PowerShell",
# or from a terminal in this folder:  powershell -ExecutionPolicy Bypass -File .\push-to-github.ps1

$ErrorActionPreference = "Stop"
$RepoName = "trace"

Write-Host ""
Write-Host "Trace -> GitHub" -ForegroundColor Cyan
Write-Host "---------------"

if (-not (Test-Path "package.json")) {
  Write-Host "Run this from the project root (the folder containing package.json)." -ForegroundColor Red
  exit 1
}

# --- git identity -----------------------------------------------------------
if (-not (git config user.email)) {
  $email = Read-Host "Your git email"
  git config user.email $email
}
if (-not (git config user.name)) {
  $name = Read-Host "Your git name"
  git config user.name $name
}

# --- local repo -------------------------------------------------------------
if (-not (Test-Path ".git")) {
  Write-Host "Initialising git repo..." -ForegroundColor Yellow
  git init -q
}
git add -A
if (git diff --cached --quiet) {
  Write-Host "Nothing new to commit." -ForegroundColor DarkGray
} else {
  git commit -q -m "Trace: gaming identity platform"
  Write-Host "Committed." -ForegroundColor Green
}
git branch -M main

# --- remote -----------------------------------------------------------------
$hasGh = $null -ne (Get-Command gh -ErrorAction SilentlyContinue)
$remote = git remote get-url origin 2>$null

if (-not $remote) {
  if ($hasGh) {
    gh auth status 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Logging in to GitHub..." -ForegroundColor Yellow
      gh auth login
    }
    Write-Host "Creating the repo and pushing..." -ForegroundColor Yellow
    gh repo create $RepoName --private --source=. --remote=origin --push
    Write-Host ""
    Write-Host "Done. Tell Claude the repo is up and it will link Vercel." -ForegroundColor Green
    exit 0
  }

  Write-Host ""
  Write-Host "The GitHub CLI isn't installed, so create the repo in the browser:" -ForegroundColor Yellow
  Write-Host "  1. Open https://github.com/new"
  Write-Host "  2. Name it '$RepoName'. Do NOT add a README, .gitignore or licence."
  Write-Host "  3. Create it, then come back here."
  Write-Host ""
  $user = Read-Host "Your GitHub username"
  git remote add origin "https://github.com/$user/$RepoName.git"
}

Write-Host "Pushing..." -ForegroundColor Yellow
git push -u origin main
Write-Host ""
Write-Host "Pushed. Tell Claude the repo is up and it will link Vercel." -ForegroundColor Green
