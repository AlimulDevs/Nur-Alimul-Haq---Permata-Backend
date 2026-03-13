#!/usr/bin/env bash
# Waits for MSSQL to be fully ready then creates the application database.
set -e

HOST="mssql"
PORT="1433"
SA_PASSWORD="${MSSQL_SA_PASSWORD:-YourStrong!Passw0rd}"
DB_NAME="${DB_NAME:-BookstoreDB}"

echo "[init] Waiting for MSSQL to accept connections..."
for i in $(seq 1 30); do
  /opt/mssql-tools/bin/sqlcmd -S "$HOST,$PORT" -U sa -P "$SA_PASSWORD" \
    -Q "SELECT 1" -b -C > /dev/null 2>&1 && break
  echo "[init] Attempt $i/30 failed, retrying in 5s..."
  sleep 5
done

echo "[init] Creating database '$DB_NAME' if it does not exist..."
/opt/mssql-tools/bin/sqlcmd -S "$HOST,$PORT" -U sa -P "$SA_PASSWORD" -C -Q "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${DB_NAME}')
BEGIN
    CREATE DATABASE [${DB_NAME}];
    PRINT 'Database created.';
END
ELSE
    PRINT 'Database already exists.';
"

echo "[init] Done."
