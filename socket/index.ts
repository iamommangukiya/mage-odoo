import { createServer } from "http";
import SocketServer from "./server";

// Create a basic HTTP server
const httpServer = createServer();

// Instantiate your SocketServer
const socketServer = new SocketServer(httpServer);

// Start listening on a port (default: 3001)
const PORT = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 