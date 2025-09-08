@echo off
echo Setting up RabbitSocialNetwork with SQLite...

echo.
echo 1. Installing dependencies...
npm install

echo.
echo 2. Setting up SQLite database...
npm run db:push

echo.
echo 3. Setup complete!
echo.
echo To start the application, run:
echo   npm run dev:windows
echo.
echo The app will be available at: http://localhost:3000
pause
