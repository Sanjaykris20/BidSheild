<#
.SYNOPSIS
    BidCompliance AI Platform - Unified Startup Script
    Starts all services: Python Backend (8000), Node Backend (3000), AI Engine (8001)

.DESCRIPTION
    This script starts all components of the BidCompliance AI Platform for SIH 26100.
    Each service runs in its own PowerShell window for easy monitoring.

.NOTES
    Requires: Python 3.10+, Node.js 18+, npm packages installed
    Run from project root: C:\Users\sanja\Desktop\Projects\BidSheild
#>

param(
    [switch]$SkipInstall,
    [switch]$OnlyBackend,
    [switch]$OnlyNode,
    [switch]$OnlyAI
)

$ErrorActionPreference = "Stop"
$ProjectRoot = "C:\Users\sanja\Desktop\Projects\BidSheild"

$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red
$Cyan = [ConsoleColor]::Cyan
$Gray = [ConsoleColor]::Gray

function Write-Colored($message, $color = $Gray) {
    Write-Host $message -ForegroundColor $color
}

function Start-Service($name, $scriptBlock, $workingDir) {
    $encodedCommand = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($scriptBlock))
    Start-Process powershell.exe -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-EncodedCommand", $encodedCommand -WindowStyle Normal
    Write-Colored "  Started: $name" $Green
}

Write-Colored "`n╔═══════════════════════════════════════════════════════════════════════╗" $Cyan
Write-Colored "║  BidCompliance AI Platform - SIH 26100                               ║" $Cyan
Write-Colored "║  Unified Startup Script                                              ║" $Cyan
Write-Colored "╚═══════════════════════════════════════════════════════════════════════╝`n" $Cyan

# Check prerequisites
Write-Colored "Checking prerequisites..." $Yellow

try {
    $pythonVersion = python --version 2>&1
    Write-Colored "  Python: $pythonVersion" $Green
} catch {
    Write-Colored "  Python: NOT FOUND - Please install Python 3.10+" $Red
    exit 1
}

try {
    $nodeVersion = node --version 2>&1
    Write-Colored "  Node.js: $nodeVersion" $Green
} catch {
    Write-Colored "  Node.js: NOT FOUND - Please install Node.js 18+" $Red
    exit 1
}

# Check .env file
if (-not (Test-Path "$ProjectRoot\.env")) {
    Write-Colored "  .env file not found! Creating from .env.example..." $Yellow
    Copy-Item "$ProjectRoot\.env.example" "$ProjectRoot\.env" -Force
}

Write-Colored "`nInstalling dependencies..." $Yellow

if (-not $SkipInstall) {
    # Python Backend Dependencies
    if (-not $OnlyNode -and -not $OnlyAI) {
        Write-Colored "  Installing Python backend dependencies..." $Cyan
        Set-Location "$ProjectRoot\backend"
        if (-not (Test-Path ".venv")) {
            python -m venv .venv
        }
        .\.venv\Scripts\pip install --upgrade pip -q
        .\.venv\Scripts\pip install -r requirements.txt -q
        Write-Colored "  Python backend dependencies installed" $Green
    }

    # AI Engine Dependencies
    if (-not $OnlyBackend -and -not $OnlyNode) {
        Write-Colored "  Installing AI Engine dependencies..." $Cyan
        Set-Location "$ProjectRoot\ai-engine"
        if (-not (Test-Path "venv")) {
            python -m venv venv
        }
        .\venv\Scripts\pip install --upgrade pip -q
        .\venv\Scripts\pip install -r requirements.txt -q
        Write-Colored "  AI Engine dependencies installed" $Green
    }

    # Node Backend Dependencies
    if (-not $OnlyBackend -and -not $OnlyAI) {
        Write-Colored "  Installing Node.js dependencies..." $Cyan
        Set-Location $ProjectRoot
        if (-not (Test-Path "node_modules")) {
            npm install
        }
        Write-Colored "  Node.js dependencies installed" $Green
    }
}

Set-Location $ProjectRoot

Write-Colored "`nStarting services..." $Yellow

$services = @()

if (-not $OnlyNode -and -not $OnlyAI) {
    # Python Backend (Port 8000)
    $services += @{Name="Python Backend (FastAPI)"; Port=8000; URL="http://localhost:8000"; Health="http://localhost:8000/"}
    Start-Service "Python Backend" {
        Set-Location 'C:\Users\sanja\Desktop\Projects\BidSheild\backend'
        Write-Host "Starting Python Backend on port 8000..." -ForegroundColor Cyan
        .\.venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    } "$ProjectRoot\backend"
}

if (-not $OnlyBackend -and -not $OnlyAI) {
    # Node Backend (Port 3000) - serves the HTML frontend and API gateway
    $services += @{Name="Node Backend (Express)"; Port=3000; URL="http://localhost:3000"; Health="http://localhost:3000/api/health"}
    Start-Service "Node Backend" {
        Set-Location 'C:\Users\sanja\Desktop\Projects\BidSheild'
        Write-Host "Starting Node Backend on port 3000..." -ForegroundColor Cyan
        npm run dev
    } "$ProjectRoot"
}

if (-not $OnlyBackend -and -not $OnlyNode) {
    # AI Engine (Port 8001)
    $services += @{Name="AI Engine (FastAPI)"; Port=8001; URL="http://localhost:8001"; Health="http://localhost:8001/"}
    Start-Service "AI Engine" {
        Set-Location 'C:\Users\sanja\Desktop\Projects\BidSheild\ai-engine'
        Write-Host "Starting AI Engine on port 8001..." -ForegroundColor Cyan
        .\venv\Scripts\uvicorn main:app --reload --host 0.0.0.0 --port 8001
    } "$ProjectRoot\ai-engine"
}

# Summary
Write-Colored "`n╔═══════════════════════════════════════════════════════════════════════╗" $Cyan
Write-Colored "║  Services Started                                                    ║" $Cyan
Write-Colored "╚═══════════════════════════════════════════════════════════════════════╝" $Cyan

foreach ($svc in $services) {
    Write-Colored "  $($svc.Name)`t→ $($svc.URL)" $Green
}

Write-Colored "`nAccess Points:" $Yellow
Write-Colored "  📊 Main Platform:          http://localhost:3000" $Cyan
Write-Colored "  🐍 Python API Docs:          http://localhost:8000/docs" $Cyan
Write-Colored "  🤖 AI Engine Docs:           http://localhost:8001/docs" $Cyan
Write-Colored "  💚 Health Check:            http://localhost:3000/api/health" $Cyan

Write-Colored "`nPress Ctrl+C in each window to stop services." $Gray

Write-Host "Press any key to exit this launcher (services will continue running)..." -ForegroundColor $Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")