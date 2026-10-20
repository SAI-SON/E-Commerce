@echo off
echo ======================================================
echo       STARTING VASTRA E-COMMERCE FULL STACK
echo ======================================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api/v1
echo.
cd /d "%~dp0.."
call npm run dev
pause
