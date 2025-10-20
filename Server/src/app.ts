import { ServerSetup } from './setup/setup';

const server = new ServerSetup();

// Start the server
server.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

export default server.getApp();