import { WebSocketServer } from 'ws';
import type { Server } from 'http';

/**
 * WebSocket server for real-time features with high concurrency support
 * Optimized for 1-10 lakh concurrent connections
 */

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    perMessageDeflate: {
      zlibDeflateOptions: {
        level: 3, // Balanced compression
        windowBits: 8,
      },
      threshold: 1024,
      concurrencyLimit: 10,
      serverMaxNoContextTakeover: true, // Memory optimization
    },
    maxPayload: 64 * 1024, // 64KB max message size
    skipUTF8Validation: false,
  });

  // Connection pooling for WebSocket
  const connections = new Map<string, any>();
  
  wss.on('connection', (ws, req) => {
    const clientId = req.headers['x-client-id'] as string || Math.random().toString(36);
    connections.set(clientId, ws);
    
    // Heartbeat mechanism for connection health
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(ws, message, clientId);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      connections.delete(clientId);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connections.delete(clientId);
    });
  });

  // Heartbeat interval to remove dead connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (!ws.isAlive) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 seconds

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  return wss;
}

function handleWebSocketMessage(ws: any, message: any, clientId: string) {
  switch (message.type) {
    case 'video_progress':
      // Broadcast video progress to other clients if needed
      broadcastToRoom(message.roomId, {
        type: 'user_progress_update',
        userId: message.userId,
        videoId: message.videoId,
        progress: message.progress
      }, clientId);
      break;
      
    case 'join_room':
      ws.roomId = message.roomId;
      break;
      
    case 'live_viewer_count':
      // Handle live viewer count updates
      updateViewerCount(message.videoId, message.action);
      break;
      
    default:
      console.log('Unknown WebSocket message type:', message.type);
  }
}

function broadcastToRoom(roomId: string, message: any, excludeClientId?: string) {
  // Implementation for room-based broadcasting
  // This would be used for features like live viewer counts, synchronized watching, etc.
}

function updateViewerCount(videoId: string, action: 'join' | 'leave') {
  // Implementation for real-time viewer count updates
}