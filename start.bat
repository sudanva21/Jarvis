@echo off
echo ================================================
echo    JARVIS - Just A Rather Very Intelligent System
echo ================================================
echo.
echo Starting JARVIS systems...
echo.

REM Start backend server in new window
echo Starting Backend Server...
start "JARVIS Backend" cmd /k "cd backend && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend development server
echo Starting Frontend Interface...
start "JARVIS Frontend" cmd /k "npm run dev"

echo.
echo ================================================
echo JARVIS is initializing...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ================================================
echo.
echo Press any key to exit (servers will continue running)
pause > nul
