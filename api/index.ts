import app from '../src/app';
import { connectDatabase } from '../src/config/database';

// Initialize the database connection outside the request handler
// This allows the connection pool to be reused across serverless invocations (warm starts)
connectDatabase().catch((error) => {
  console.error('Failed to connect to database in serverless function:', error);
});

// Export the Express app for Vercel's serverless environment
export default app;
