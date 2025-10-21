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

// Helper function for detailed logging
function logGameEvent(code: string, event: string, details?: any) {
  const timestamp = new Date().toISOString();
  const room = gameRooms.get(code.toUpperCase());
  
  if (!room) {
    console.log(`[${timestamp}] [ROOM ${code}] ${event}`);
    return;
  }
  
  const playerNames = room.players.map(p => `${p.name} (${p.avatar})`).join(" vs ");
  let logMessage = `[${timestamp}] [ROOM ${code}] ${event} | Players: ${playerNames}`;
  
  if (details) {
    logMessage += ` | ${JSON.stringify(details)}`;
  }
  
  console.log(logMessage);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Get all active rooms (for monitoring)
  app.get("/api/rooms", (req, res) => {
    const rooms = Array.from(gameRooms.values()).map(room => ({
      code: room.code,
      mode: room.mode,
      status: room.status,
      players: room.players.map(p => ({
        name: p.name,
        avatar: p.avatar,
        status: p.status
      })),
      guesses: room.gameHistory.length,
      createdAt: room.createdAt
    }));
    
    console.log(`[MONITOR] Active rooms: ${rooms.length}`);
    rooms.forEach(room => {
      const playerNames = room.players.map(p => p.name).join(" vs ");
      console.log(`  - ${room.code}: ${playerNames} | ${room.status} | ${room.mode} | ${room.guesses} guesses`);
    });
    
    res.json({ rooms, total: rooms.length });
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
    
    const isNewRoom = !gameRooms.has(code.toUpperCase());
    gameRooms.set(code.toUpperCase(), roomData);
    
    // Log room creation
    if (isNewRoom) {
      logGameEvent(code, "🎮 ROOM CREATED", {
        mode: roomData.mode,
        host: roomData.players[0]?.name,
        totalRows: roomData.totalRows
      });
    }
    
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
    
    // Log different types of updates
    if (updates.players && updates.players.length > existing.players.length) {
      // New player joined
      const newPlayer = updates.players[updates.players.length - 1];
      logGameEvent(code, "👥 PLAYER JOINED", {
        player: newPlayer.name,
        avatar: newPlayer.avatar,
        totalPlayers: updates.players.length
      });
    }
    
    if (updates.status === 'playing' && existing.status === 'waiting') {
      // Game started
      logGameEvent(code, "🎯 GAME STARTED", {
        mode: updated.mode,
        totalRows: updated.totalRows
      });
    }
    
    if (updates.gameHistory && updates.gameHistory.length > existing.gameHistory.length) {
      // New guess made
      const lastGuess = updates.gameHistory[updates.gameHistory.length - 1];
      const player = updated.players.find((p: Player) => p.id === lastGuess?.playerId);
      const correctCount = lastGuess.result.filter(r => r === 'correct').length;
      const presentCount = lastGuess.result.filter(r => r === 'present').length;
      
      logGameEvent(code, "💭 GUESS MADE", {
        player: player?.name,
        guess: lastGuess.guess,
        correct: correctCount,
        present: presentCount,
        attempt: `${updates.gameHistory.length}/${updated.totalRows}`
      });
      
      // Check if word was found
      if (correctCount === 5) {
        logGameEvent(code, "🎉 WORD FOUND!", {
          player: player?.name,
          word: lastGuess.guess,
          attempts: updates.gameHistory.filter((h: GuessHistory) => h.playerId === player?.id).length
        });
      }
    }
    
    if (updates.status === 'finished' && existing.status === 'playing') {
      // Game finished
      const winner = updated.gameHistory.find((h: GuessHistory) => 
        h.result.every(r => r === 'correct')
      );
      const winnerPlayer = winner ? updated.players.find((p: Player) => p.id === winner.playerId) : null;
      
      logGameEvent(code, "🏁 GAME FINISHED", {
        winner: winnerPlayer?.name || 'No winner',
        totalGuesses: updated.gameHistory.length,
        mode: updated.mode
      });
    }
    
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