@echo off
setlocal enabledelayedexpansion
set PGPASSWORD=saison@2005
set BACKUP_DIR=%~dp0..\backups

if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
set TIMESTAMP=%dt:~0,8%_%dt:~8,6%
set BACKUP_FILE=%BACKUP_DIR%\vastra_db_%TIMESTAMP%.sql

echo ======================================================
echo             VASTRA DATABASE BACKUP TOOL
echo ======================================================
echo Backing up vastra_db from localhost:5432...
echo Output file: %BACKUP_FILE%
echo.

"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -h localhost -p 5432 -U postgres -d vastra_db -F p -f "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Backup created successfully:
    echo %BACKUP_FILE%
) else (
    echo [FAILED] Backup failed with exit code: %ERRORLEVEL%
)

echo.
pause
