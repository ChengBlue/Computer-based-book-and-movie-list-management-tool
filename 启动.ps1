# Book/Movie List Manager - Quick Start

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Book/Movie List Manager - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; ..\.venv\Scripts\python run.py" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "[2/2] Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Started successfully!" -ForegroundColor Green
Write-Host " Backend: http://localhost:8000" -ForegroundColor Green
Write-Host " Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host " API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Read-Host "Press Enter to exit"
