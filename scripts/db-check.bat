@echo off
cd /d "%~dp0.."
npx tsx scripts/db-check.ts
pause
