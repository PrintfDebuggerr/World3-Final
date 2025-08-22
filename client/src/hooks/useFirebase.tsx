import { useCallback } from 'react';
import { GameRoom } from '../types/game';

// Backend API base URL - Railway'de otomatik olarak doğru domain kullanılacak
const API_BASE_URL = window.location.origin;

export function useBackendAPI() {
  const saveRoomToDatabase = useCallback(async (roomCode: string, roomData: GameRoom) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving room:', error);
      throw new Error('Oda kaydedilemedi');
    }
  }, []);

  const getRoomFromDatabase = useCallback(async (roomCode: string): Promise<GameRoom | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomCode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Room not found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }, []);

  const updateRoomInDatabase = useCallback(async (roomCode: string, updates: Partial<GameRoom>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomCode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating room:', error);
      throw new Error('Oda güncellenemedi');
    }
  }, []);

  const setupRoomListener = useCallback((roomCode: string, callback: (roomData: GameRoom | null) => void) => {
    // Polling-based approach for real-time updates
    const interval = setInterval(async () => {
      try {
        const roomData = await getRoomFromDatabase(roomCode);
        callback(roomData);
      } catch (error) {
        console.error('Error in room listener:', error);
      }
    }, 2000); // Check every 2 seconds

    // Return cleanup function
    return () => clearInterval(interval);
  }, [getRoomFromDatabase]);

  return {
    saveRoomToDatabase,
    getRoomFromDatabase,
    updateRoomInDatabase,
    setupRoomListener
  };
}
