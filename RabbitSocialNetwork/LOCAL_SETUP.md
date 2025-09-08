# Local Setup Guide for RabbitSocialNetwork

This guide will help you set up and run the RabbitSocialNetwork project on your local Windows machine.

## Prerequisites

1. **Node.js and npm**: Install the latest LTS version from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL**: Install from [postgresql.org](https://www.postgresql.org/download/windows/)
3. **Git**: Install from [git-scm.com](https://git-scm.com/download/win)

## Setup Steps

### 1. Clone the Repository

If you haven't already, clone the repository to your local machine.

### 2. Environment Configuration

1. Copy the `.env.example` file to a new file named `.env`
2. Update the `.env` file with your configuration:
   ```
   # Required environment variables
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   SESSION_SECRET=your_session_secret_here

   # Database configuration
   DATABASE_URL=postgres://postgres:your_password@localhost:5432/rabbit_social_network

   # Server configuration
   PORT=5000
   NODE_ENV=development
   ```

### 3. Database Setup

1. Open pgAdmin or any PostgreSQL client
2. Create a new database named `rabbit_social_network`
3. Make sure the `DATABASE_URL` in your `.env` file points to this database with the correct credentials

### 4. Install Dependencies

Run the following command in the project root directory:

```bash
npm install
```

### 5. Run Database Migrations

To set up the database schema, run:

```bash
npm run db:push
```

### 6. Start the Development Server

You can use the provided batch file or run the commands manually:

**Option 1: Using the batch file**

Simply run the `run-local.bat` file by double-clicking it or running it from the command line.

**Option 2: Manual commands**

```bash
npm run dev:windows
```

The server should start and be accessible at http://localhost:5000

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check that the `DATABASE_URL` in your `.env` file has the correct credentials
- Make sure the database `rabbit_social_network` exists

### OAuth Configuration

For Google OAuth to work locally:

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Set up OAuth credentials with redirect URI: `http://localhost:5000/auth/google/callback`
3. Add the Client ID and Secret to your `.env` file

### Session Secret

Generate a strong random string for `SESSION_SECRET` in your `.env` file. This is important for security.