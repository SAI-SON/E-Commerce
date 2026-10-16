@echo off
set PGPASSWORD=saison@2005
echo ======================================================
echo       CONNECTING TO POSTGRESQL (PSQL CLI)
echo ======================================================
echo Host: localhost:5432
echo User: postgres
echo Database: vastra_db
echo.
echo Type \q to exit, \dt to list tables, \d TableName to inspect.
echo ------------------------------------------------------
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d vastra_db
