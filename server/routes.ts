import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

interface GameRoom {
  code: string;
  mode: 'sequential' | 'duel';
  host: string;
  players: any[];
  status: 'waiting' | 'playing' | 'finished';
  word: string;
  player1Word?: string;
  player2Word?: string;
  currentTurn: number;
  createdAt: number;
  gameHistory: any[];
  totalRows: number;
}

// In-memory storage for rooms
const gameRooms = new Map<string, GameRoom>();
const playerConnections = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Get room information
  app.get("/api/room/:code", (req, res) => {
    const { code } = req.params;
    const room = gameRooms.get(code.toUpperCase());
    
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    res.json(room);
  });

  // REST API for rooms
  app.get("/api/rooms/:code", (req, res) => {
    const { code } = req.params;
    const room = gameRooms.get(code.toUpperCase());
    
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    res.json(room);
  });

  app.put("/api/rooms/:code", (req, res) => {
    const { code } = req.params;
    const roomData = req.body;
    
    gameRooms.set(code.toUpperCase(), roomData);
    broadcastToRoom(code.toUpperCase(), { type: 'room_update', room: roomData });
    
    res.json(roomData);
  });

  app.patch("/api/rooms/:code", (req, res) => {
    const { code } = req.params;
    const updates = req.body;
    const existing = gameRooms.get(code.toUpperCase());
    
    if (!existing) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    const updated = { ...existing, ...updates };
    gameRooms.set(code.toUpperCase(), updated);
    broadcastToRoom(code.toUpperCase(), { type: 'room_update', room: updated });
    
    res.json(updated);
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server on the same server
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Remove player from connections
      for (const [playerId, connection] of Array.from(playerConnections.entries())) {
        if (connection === ws) {
          playerConnections.delete(playerId);
          // Update player status in rooms
          for (const room of Array.from(gameRooms.values())) {
            const player = room.players.find((p: any) => p.id === playerId);
            if (player) {
              player.status = 'disconnected';
              player.lastSeen = Date.now();
              broadcastToRoom(room.code, { type: 'room_update', room });
            }
          }
          break;
        }
      }
    });
  });

  function handleWebSocketMessage(ws: WebSocket, message: any) {
    const { type, data } = message;

    switch (type) {
      case 'join_room':
        handleJoinRoom(ws, data);
        break;
      case 'create_room':
        handleCreateRoom(ws, data);
        break;
      case 'submit_guess':
        handleSubmitGuess(ws, data);
        break;
      case 'player_reconnect':
        handlePlayerReconnect(ws, data);
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  function handleCreateRoom(ws: WebSocket, data: any) {
    const { roomCode, roomData, playerId } = data;
    
    gameRooms.set(roomCode, roomData);
    playerConnections.set(playerId, ws);
    
    ws.send(JSON.stringify({ 
      type: 'room_created', 
      roomCode, 
      room: roomData 
    }));
  }

  function handleJoinRoom(ws: WebSocket, data: any) {
    const { roomCode, player } = data;
    const room = gameRooms.get(roomCode);
    
    if (!room) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
      return;
    }
    
    if (room.players.length >= 2) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
      return;
    }
    
    room.players.push(player);
    room.status = 'playing';
    playerConnections.set(player.id, ws);
    gameRooms.set(roomCode, room);
    
    // Notify all players in the room
    broadcastToRoom(roomCode, { type: 'room_update', room });
    
    ws.send(JSON.stringify({ 
      type: 'room_joined', 
      room 
    }));
  }

  function handleSubmitGuess(ws: WebSocket, data: any) {
    const { roomCode, guess, playerId } = data;
    const room = gameRooms.get(roomCode);
    
    if (!room) {
      ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
      return;
    }
    
    // Add guess to room history
    room.gameHistory.push(guess);
    
    // Check if game is finished
    if (guess.result.every((r: string) => r === 'correct')) {
      room.status = 'finished';
    } else if (room.mode === 'sequential') {
      // Switch turns
      room.currentTurn = (room.currentTurn + 1) % 2;
      room.totalRows += 1;
    }
    
    gameRooms.set(roomCode, room);
    
    // Broadcast updated room to all players
    broadcastToRoom(roomCode, { type: 'room_update', room });
  }

  function handlePlayerReconnect(ws: WebSocket, data: any) {
    const { playerId, roomCode } = data;
    const room = gameRooms.get(roomCode);
    
    if (room) {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.status = 'online';
        player.lastSeen = Date.now();
        playerConnections.set(playerId, ws);
        
        ws.send(JSON.stringify({ type: 'room_reconnected', room }));
        broadcastToRoom(roomCode, { type: 'room_update', room });
      }
    }
  }

  function broadcastToRoom(roomCode: string, message: any) {
    const room = gameRooms.get(roomCode);
    if (!room) return;
    
    room.players.forEach(player => {
      const connection = playerConnections.get(player.id);
      if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message));
      }
    });
  }

  return httpServer;
}
