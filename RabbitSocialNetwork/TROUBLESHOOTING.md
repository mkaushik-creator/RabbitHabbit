# Troubleshooting Guide: "Site Can't Be Reached"

If you're experiencing the "Site can't be reached" error when trying to run the RabbitSocialNetwork locally, follow these troubleshooting steps:

## 1. Check if the Server is Running

- Open a command prompt and run the following command to see if the server is running:
  ```
  netstat -ano | findstr :5000
  ```
- If you don't see any output, the server isn't running on port 5000.

## 2. Verify PostgreSQL Installation

- Make sure PostgreSQL is installed and running on your system.
- Open pgAdmin or another PostgreSQL client to verify you can connect to your database.
- Confirm that you've created the `rabbit_social_network` database.

## 3. Check Your .env File

- Ensure your `.env` file exists in the project root directory.
- Verify that the `DATABASE_URL` is correctly configured with your PostgreSQL credentials:
  ```
  DATABASE_URL=postgres://postgres:your_password@localhost:5432/rabbit_social_network
  ```
- Make sure `SESSION_SECRET` is set to a non-empty string.

## 4. Install Dependencies

- Run the following command to ensure all dependencies are installed:
  ```
  npm install
  ```

## 5. Run Database Migrations

- Execute the database migration to set up the schema:
  ```
  npm run db:push
  ```

## 6. Start the Server in Debug Mode

- Try running the server with more verbose logging:
  ```
  set DEBUG=* && npm run dev:windows
  ```
- Check the console output for any error messages.

## 7. Check for Port Conflicts

- Another application might be using port 5000. Try changing the port in your `.env` file:
  ```
  PORT=3000
  ```
- Then restart the server.

## 8. Firewall or Antivirus Issues

- Temporarily disable your firewall or antivirus to check if they're blocking the connection.

## 9. Try a Different Browser

- Sometimes browser extensions or cache can cause connection issues. Try a different browser or incognito mode.

## 10. Check Network Configuration

- Ensure your network allows localhost connections.
- Try accessing the site using the IP address directly: `http://127.0.0.1:5000`

## Common Error Messages and Solutions

### Database Connection Errors

- **Error**: "Error: connect ECONNREFUSED 127.0.0.1:5432"
  - **Solution**: PostgreSQL is not running. Start the PostgreSQL service.

- **Error**: "Error: database 'rabbit_social_network' does not exist"
  - **Solution**: Create the database using pgAdmin or the command line.

### Node.js Errors

- **Error**: "Error: Cannot find module..."
  - **Solution**: Run `npm install` to install missing dependencies.

- **Error**: "Error: listen EADDRINUSE: address already in use :::5000"
  - **Solution**: Change the port in your `.env` file or stop the process using port 5000.

## Running the Project Step by Step

1. Open a command prompt in the project directory.
2. Run `npm install` to install dependencies.
3. Ensure PostgreSQL is running and the database is created.
4. Run `npm run db:push` to set up the database schema.
5. Run `npm run dev:windows` to start the server.
6. Open your browser and navigate to `http://localhost:5000`.

If you're still experiencing issues after following these steps, please provide the specific error message you're seeing for more targeted assistance.