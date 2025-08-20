import { createServer } from "http";
import { Express } from "express";
import { Server } from "http";

interface GameRoom {
  code: string;
  mode: 'sequential' | 'duel';
  host: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  word: string;
  player1Word?: string;
  player2Word?: string;
  currentTurn: number;
  createdAt: number;
  gameHistory: GuessHistory[];
  totalRows: number;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'disconnected';
  lastSeen: number;
}

interface GuessHistory {
  playerId: string;
  guess: string;
  result: ('correct' | 'present' | 'absent')[];
  rowIndex: number;
  timestamp: number;
}

// In-memory storage for rooms
const gameRooms = new Map<string, GameRoom>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
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
    res.json(updated);
  });

  // Legacy room endpoint
  app.get("/api/room/:code", (req, res) => {
    const { code } = req.params;
    const room = gameRooms.get(code.toUpperCase());
    
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    
    res.json(room);
  });

  // Create HTTP server (no WebSocket)
  const httpServer = createServer(app);

  return httpServer;
}