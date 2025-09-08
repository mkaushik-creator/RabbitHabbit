// Simple script to test database connection
import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import ws from 'ws';

// Load environment variables
dotenv.config();

// Configure Neon database connection
const neonConfig = { webSocketConstructor: ws };

async function testConnection() {
  console.log('Testing database connection...');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***configured***' : 'NOT CONFIGURED'}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set in your .env file');
    console.log('Please make sure you have a .env file with DATABASE_URL configured');
    return;
  }

  try {
    // Create the database connection pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test the connection
    const result = await pool.query('SELECT NOW() as current_time');
    
    console.log('✅ Database connection successful!');
    console.log(`Current database time: ${result.rows[0].current_time}`);
    
    // Close the connection
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure PostgreSQL is installed and running');
    console.log('2. Check that the database exists');
    console.log('3. Verify your DATABASE_URL in the .env file is correct');
    console.log('4. Ensure your firewall is not blocking the connection');
  }
}

testConnection();