@echo off
echo RabbitSocialNetwork Troubleshooting Tool
echo =====================================
echo.

REM Check if .env file exists
echo Checking for .env file...
if not exist .env (
  echo ERROR: .env file not found!
  echo Creating .env file from template...
  copy .env.example .env
  echo Please update the .env file with your credentials
  echo Especially set DATABASE_URL and SESSION_SECRET
) else (
  echo .env file found.
)

REM Check if PostgreSQL is installed
echo.
echo Checking PostgreSQL installation...
where psql >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo WARNING: PostgreSQL command line tools not found in PATH.
  echo Please ensure PostgreSQL is installed and added to your PATH.
) else (
  echo PostgreSQL command line tools found.
)

REM Check if port 5000 is in use
echo.
echo Checking if port 5000 is already in use...
netstat -ano | findstr :5000 >nul
if %ERRORLEVEL% equ 0 (
  echo WARNING: Port 5000 is already in use by another application.
  echo Consider changing the PORT in your .env file.
) else (
  echo Port 5000 is available.
)

REM Check if node_modules exists
echo.
echo Checking for node_modules...
if not exist node_modules (
  echo WARNING: node_modules not found. Dependencies may not be installed.
  echo Running npm install...
  npm install
) else (
  echo node_modules found.
)

REM Offer to test database connection
echo.
echo Would you like to test the database connection? (Y/N)
set /p test_db=
if /i "%test_db%"=="Y" (
  echo Testing database connection...
  node -e "const { Pool } = require('@neondatabase/serverless'); require('dotenv').config(); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()', (err, res) => { if (err) { console.error('Database connection error:', err); } else { console.log('Database connection successful!'); console.log(res.rows[0]); } pool.end(); });"
)

REM Offer to start the server
echo.
echo Would you like to start the server now? (Y/N)
set /p start_server=
if /i "%start_server%"=="Y" (
  echo Starting server...
  echo If the server fails to start, check the error messages.
  set NODE_ENV=development
  npx tsx server/index.ts
)

echo.
echo Troubleshooting complete. If you're still experiencing issues,
echo please refer to the TROUBLESHOOTING.md file for more detailed guidance.
echo.

pause