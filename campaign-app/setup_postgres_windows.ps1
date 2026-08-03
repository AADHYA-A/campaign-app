# setup_postgres_windows.ps1
# Run this ONCE after PostgreSQL is installed to create the database and user
# matching the docker-compose.yml credentials.
#
# Usage (in PowerShell as admin):
#   .\setup_postgres_windows.ps1

param(
    [string]$PgBinPath = "C:\Program Files\PostgreSQL\18\bin"
)

$env:PGPASSWORD = "postgres"   # default superuser password set during install

Write-Host "==> Creating user 'admin'..." -ForegroundColor Cyan
& "$PgBinPath\psql.exe" -U postgres -c "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN CREATE ROLE admin LOGIN PASSWORD 'adminpassword'; END IF; END `$`$;"

Write-Host "==> Creating database 'campaign_db'..." -ForegroundColor Cyan
& "$PgBinPath\psql.exe" -U postgres -c "SELECT 'CREATE DATABASE campaign_db OWNER admin' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'campaign_db')" | & "$PgBinPath\psql.exe" -U postgres

Write-Host "==> Granting privileges..." -ForegroundColor Cyan
& "$PgBinPath\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE campaign_db TO admin;"
& "$PgBinPath\psql.exe" -U postgres -d campaign_db -c "GRANT ALL ON SCHEMA public TO admin;"

Write-Host ""
Write-Host "==> Done! Verifying connection as 'admin'..." -ForegroundColor Green
$env:PGPASSWORD = "adminpassword"
& "$PgBinPath\psql.exe" -U admin -d campaign_db -c "SELECT current_user, current_database();"

Write-Host ""
Write-Host "PostgreSQL is ready. You can now run:" -ForegroundColor Green
Write-Host "  cd campaign-app\backend" -ForegroundColor Yellow
Write-Host "  .\venv\Scripts\alembic upgrade head" -ForegroundColor Yellow
