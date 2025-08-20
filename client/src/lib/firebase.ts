// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wordle-duo-demo.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://wordle-duo-demo-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wordle-duo-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wordle-duo-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo"
};

// Backend-based storage using REST API
class MockFirebase {
  private listeners: Map<string, Function[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  async init() {
    console.log('Firebase initialized (backend mode)');
  }

  ref(path: string) {
    return {
      set: async (data: any) => {
        const roomCode = path.replace('rooms/', '');
        try {
          const response = await fetch(`/api/rooms/${roomCode}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!response.ok) throw new Error('Failed to save room');
          this.notifyListeners(path, data);
        } catch (error) {
          console.error('Error saving room:', error);
          throw error;
        }
      },
      update: async (data: any) => {
        const roomCode = path.replace('rooms/', '');
        try {
          const response = await fetch(`/api/rooms/${roomCode}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!response.ok) throw new Error('Failed to update room');
          const updated = await response.json();
          this.notifyListeners(path, updated);
        } catch (error) {
          console.error('Error updating room:', error);
          throw error;
        }
      },
      on: (event: string, callback: Function) => {
        if (!this.listeners.has(path)) {
          this.listeners.set(path, []);
        }
        this.listeners.get(path)!.push(callback);
        
        // Start polling for changes
        const roomCode = path.replace('rooms/', '');
        const poll = async () => {
          try {
            const response = await fetch(`/api/rooms/${roomCode}`);
            if (response.ok) {
              const data = await response.json();
              callback({ val: () => data });
            }
          } catch (error) {
            console.error('Error polling room:', error);
          }
        };
        
        // Poll immediately and then every 500ms for faster updates
        poll();
        const intervalId = setInterval(poll, 500);
        this.intervals.set(path, intervalId);
        
        return callback;
      },
      off: (event: string, callback: Function) => {
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
          const index = pathListeners.indexOf(callback);
          if (index > -1) {
            pathListeners.splice(index, 1);
          }
        }
        
        // Clear polling interval
        const intervalId = this.intervals.get(path);
        if (intervalId) {
          clearInterval(intervalId);
          this.intervals.delete(path);
        }
      },
      once: async (event: string) => {
        const roomCode = path.replace('rooms/', '');
        try {
          const response = await fetch(`/api/rooms/${roomCode}`);
          if (response.ok) {
            const data = await response.json();
            return { val: () => data };
          } else {
            return { val: () => null };
          }
        } catch (error) {
          console.error('Error fetching room:', error);
          return { val: () => null };
        }
      }
    };
  }

  private notifyListeners(path: string, data: any) {
    const listeners = this.listeners.get(path) || [];
    listeners.forEach(listener => {
      listener({ val: () => data });
    });
  }

  database() {
    return {
      ref: (path: string) => this.ref(path)
    };
  }
}

export const firebase = new MockFirebase();

// Initialize Firebase
firebase.init();

export default firebase;
