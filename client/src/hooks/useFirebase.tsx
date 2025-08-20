import { useEffect, useCallback } from 'react';
import firebase from '../lib/firebase';
import { GameRoom } from '../types/game';

export function useFirebase() {
  const saveRoomToDatabase = useCallback(async (roomCode: string, roomData: GameRoom) => {
    try {
      await firebase.ref(`rooms/${roomCode}`).set(roomData);
    } catch (error) {
      console.error('Error saving room:', error);
      throw new Error('Oda kaydedilemedi');
    }
  }, []);

  const getRoomFromDatabase = useCallback(async (roomCode: string): Promise<GameRoom | null> => {
    try {
      const snapshot = await firebase.ref(`rooms/${roomCode}`).once('value');
      return snapshot.val();
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }, []);

  const updateRoomInDatabase = useCallback(async (roomCode: string, updates: Partial<GameRoom>) => {
    try {
      await firebase.ref(`rooms/${roomCode}`).update(updates);
    } catch (error) {
      console.error('Error updating room:', error);
      throw new Error('Oda güncellenemedi');
    }
  }, []);

  const setupRoomListener = useCallback((roomCode: string, callback: (roomData: GameRoom | null) => void) => {
    const roomRef = firebase.ref(`rooms/${roomCode}`);
    const listener = (snapshot: any) => {
      const roomData = snapshot.val();
      callback(roomData);
    };
    
    roomRef.on('value', listener);
    
    return () => roomRef.off('value', listener);
  }, []);

  return {
    saveRoomToDatabase,
    getRoomFromDatabase,
    updateRoomInDatabase,
    setupRoomListener
  };
}
