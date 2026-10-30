# Automated Deployment Script for MugenChessX (Windows PowerShell)
# Usage: .\deploy-firebase.ps1 [-Target hosting|firestore|all]

param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("hosting", "firestore", "all")]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  MUGENCHESSX FIREBASE DEPLOYMENT UTILITY " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Environment & Tool Prerequisites Check
Write-Host "`n[1/5] Checking CLI Tooling Prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not in PATH. Please install Node.js before proceeding."
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed or not in PATH."
    exit 1
}

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "[X] Firebase CLI tool is missing." -ForegroundColor Red
    Write-Host "Please install it globally by running:" -ForegroundColor Yellow
    Write-Host "  npm install -g firebase-tools" -ForegroundColor White
    exit 1
}

Write-Host "[OK] Node.js, npm, and Firebase CLI detected." -ForegroundColor Green

# 2. Execute Clean Cross-Platform Production Build
Write-Host "`n[2/5] Executing Cross-Platform Vite Build (npx vite build)..." -ForegroundColor Yellow
npx vite build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Vite build failed. Aborting deployment."
    exit 1
}

# 3. Verify Output Artifacts Integrity
Write-Host "`n[3/5] Verifying Build Output Artifacts in dist/..." -ForegroundColor Yellow
$distIndexPath = "dist/index.html"

if (-not (Test-Path $distIndexPath)) {
    Write-Error "dist/index.html does not exist after build. Aborting deployment."
    exit 1
}

$distContent = Get-Content $distIndexPath -Raw
if (-not ($distContent -match '<script type="module"[^>]*src="/assets/')) {
    Write-Error "dist/index.html is invalid or missing compiled asset script tags. Aborting deployment."
    exit 1
}

Write-Host "[OK] dist/index.html verified successfully." -ForegroundColor Green

# 4. Deploy Firebase Hosting (if targeted)
if ($Target -eq "hosting" -or $Target -eq "all") {
    Write-Host "`n[4/5] Firebase Hosting Deployment..." -ForegroundColor Yellow
    $confirmHosting = Read-Host "Proceed to deploy static bundle to Firebase Hosting? (Y/N)"
    if ($confirmHosting -eq "Y" -or $confirmHosting -eq "y") {
        Write-Host "Running: firebase deploy --only hosting" -ForegroundColor Cyan
        firebase deploy --only hosting
    } else {
        Write-Host "Skipping Firebase Hosting deployment." -ForegroundColor Gray
    }
}

# 5. Deploy Firestore Rules & Indexes (if targeted)
if ($Target -eq "firestore" -or $Target -eq "all") {
    Write-Host "`n[5/5] Firestore Rules & Indexes Deployment..." -ForegroundColor Yellow
    $confirmRules = Read-Host "Proceed to deploy Firestore rules and composite indexes? (Y/N)"
    if ($confirmRules -eq "Y" -or $confirmRules -eq "y") {
        Write-Host "Running: firebase deploy --only firestore:rules,firestore:indexes" -ForegroundColor Cyan
        firebase deploy --only firestore:rules,firestore:indexes
    } else {
        Write-Host "Skipping Firestore Rules deployment." -ForegroundColor Gray
    }
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "  MUGENCHESSX DEPLOYMENT WORKFLOW COMPLETED! " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
