@echo off
echo ======================================================
echo           LAUNCHING PGADMIN 4
echo ======================================================
echo.
if exist "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\pgAdmin4.exe" (
    echo Starting pgAdmin 4 from PostgreSQL 18...
    start "" "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\pgAdmin4.exe"
) else (
    echo pgAdmin 4 executable not found in default PostgreSQL 18 path.
    pause
)
