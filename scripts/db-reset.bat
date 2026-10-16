@echo off
echo ======================================================
echo           VASTRA DATABASE RESET & RE-SEED
echo ======================================================
echo WARNING: This will reset all data in vastra_db and re-seed defaults.
set /p CONFIRM="Are you sure you want to proceed? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo Reset cancelled.
    exit /b
)

echo.
echo 1/2: Running migrations...
call npm run prisma:migrate --workspace=server
if %ERRORLEVEL% neq 0 (
    echo Migration failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2/2: Seeding catalogue, categories, and test accounts...
call npm run prisma:seed --workspace=server
if %ERRORLEVEL% neq 0 (
    echo Seeding failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [SUCCESS] Database successfully reset and seeded!
pause
