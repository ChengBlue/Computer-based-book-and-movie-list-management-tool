@echo off
chcp 65001 >nul
echo ========================================
echo   Book/Movie List Manager - Quick Start
echo ========================================
echo.

REM 启动后端（使用虚拟环境）
echo [1/2] Starting backend server...
start "Backend - FastAPI" cmd /k "cd /d %~dp0backend && ..\.venv\Scripts\python run.py"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端
echo [2/2] Starting frontend server...
start "Frontend - Vite" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo Started successfully!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
pause
