@echo off
echo Testing Database Connection
echo ========================
echo.

REM Check if .env file exists
if not exist .env (
  echo ERROR: .env file not found!
  echo Creating .env file from template...
  copy .env.example .env
  echo Please update the .env file with your database credentials
  echo and run this script again.
  goto end
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ERROR: Node.js is not installed or not in your PATH.
  echo Please install Node.js from https://nodejs.org/
  goto end
)

echo Running database connection test...
echo.

REM Run the database test script
node -e "const fs = require('fs'); const dotenv = require('dotenv'); dotenv.config(); if (!process.env.DATABASE_URL) { console.error('ERROR: DATABASE_URL not found in .env file'); process.exit(1); } console.log('DATABASE_URL found in .env file: ' + (process.env.DATABASE_URL ? '***configured***' : 'NOT CONFIGURED')); const { Pool } = require('@neondatabase/serverless'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW() as current_time', (err, res) => { if (err) { console.error('\nDatabase connection FAILED!'); console.error('Error details:', err.message); console.log('\nTroubleshooting tips:'); console.log('1. Make sure PostgreSQL is installed and running'); console.log('2. Check that the database exists'); console.log('3. Verify your DATABASE_URL in the .env file is correct'); console.log('4. Ensure your firewall is not blocking the connection'); } else { console.log('\nDatabase connection SUCCESSFUL!'); console.log('Current database time:', res.rows[0].current_time); } pool.end(); });" || (
  echo.
  echo ERROR: Failed to run the database test.
  echo Make sure you have installed the required dependencies with 'npm install'.
)

:end
echo.
echo If you're still having issues, please refer to the TROUBLESHOOTING.md file.
pause