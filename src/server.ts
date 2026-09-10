import { env } from './config/env';
import { connectDatabase } from './config/database';
import app from './app';

const PORT = parseInt(env.PORT, 10);

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║     🚀 SewaShayog API Server                 ║
║     Team: WorkLoom                           ║
║     Port: ${PORT}                              ║
║     Env:  ${env.NODE_ENV.padEnd(20)}         ║
║                                              ║
║     API:  http://localhost:${PORT}/api           ║
║                                              ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();
