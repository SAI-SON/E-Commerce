import { app } from './app.js';
import { config } from './config/index.js';
import { prisma } from './config/prisma.js';

const server = app.listen(config.port, () => {
  console.log(`[Vastra Server] running on http://localhost:${config.port}`);
  console.log(`[Vastra Server] Environment: ${config.env}`);
  console.log(`[Vastra Server] Health Check: http://localhost:${config.port}/api/v1/health`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
    process.exit(0);
  });

  // Force close after 10s if stuck
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
