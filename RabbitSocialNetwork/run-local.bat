@echo off
echo Setting up RabbitSocialNetwork for local development...
echo ================================================

REM Check if .env file exists
echo Checking for .env file...
if not exist .env (
  echo Creating .env file...
  copy .env.example .env
  echo Please update the .env file with your credentials
  echo Especially set DATABASE_URL and SESSION_SECRET
  echo.
  echo IMPORTANT: After this script completes, edit the .env file before running again.
  pause
) else (
  echo .env file found.
)

REM Install dependencies
echo.
echo Installing dependencies...
npm install
if %ERRORLEVEL% neq 0 (
  echo ERROR: Failed to install dependencies.
  echo Please check your internet connection and try again.
  goto error
)

REM Check if PostgreSQL is installed
echo.
echo Checking PostgreSQL installation...
where psql >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo WARNING: PostgreSQL command line tools not found in PATH.
  echo Please ensure PostgreSQL is installed and added to your PATH.
  echo.
  echo Database Setup Instructions:
  echo 1. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
  echo 2. Create a database named 'rabbit_social_network'
  echo 3. Update the DATABASE_URL in .env with your credentials
  echo.
  echo Continue anyway? (Y/N)
  set /p continue=
  if /i "%continue%"=="N" goto end
) else (
  echo PostgreSQL command line tools found.
)

REM Check if port 5000 is in use
echo.
echo Checking if port 5000 is already in use...
netstat -ano | findstr :5000 >nul
if %ERRORLEVEL% equ 0 (
  echo WARNING: Port 5000 is already in use by another application.
  echo You may need to change the PORT in your .env file or close the other application.
  echo Continue anyway? (Y/N)
  set /p continue=
  if /i "%continue%"=="N" goto end
) else (
  echo Port 5000 is available.
)

REM Run database migrations
echo.
echo Running database migrations...
npm run db:push
if %ERRORLEVEL% neq 0 (
  echo ERROR: Failed to run database migrations.
  echo This could be due to:
  echo 1. PostgreSQL not running
  echo 2. Incorrect DATABASE_URL in .env
  echo 3. Database 'rabbit_social_network' does not exist
  echo.
  echo Would you like to run the troubleshooting script? (Y/N)
  set /p troubleshoot=
  if /i "%troubleshoot%"=="Y" (
    call troubleshoot.bat
    goto end
  ) else (
    goto error
  )
)

REM Start the development server
echo.
echo Starting development server...
echo Access the application at http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
set NODE_ENV=development
npx tsx server/index.ts
if %ERRORLEVEL% neq 0 (
  echo ERROR: Failed to start the development server.
  echo Please check the error messages above.
  goto error
)

goto end

:error
echo.
echo An error occurred during setup. Please check the messages above.
echo For more detailed troubleshooting, run troubleshoot.bat

:end
pause