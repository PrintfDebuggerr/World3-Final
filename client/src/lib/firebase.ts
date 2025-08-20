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

// Browser-based persistent storage for development
class MockFirebase {
  private storageKey = 'wordle-duo-rooms';
  private listeners: Map<string, Function[]> = new Map();

  async init() {
    console.log('Firebase initialized (mock mode)');
    this.syncWithStorage();
  }

  private getRooms(): Map<string, any> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const roomsArray = JSON.parse(stored);
        return new Map(roomsArray);
      }
    } catch (error) {
      console.error('Error loading rooms from storage:', error);
    }
    return new Map();
  }

  private saveRooms(rooms: Map<string, any>) {
    try {
      const roomsArray = Array.from(rooms.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(roomsArray));
    } catch (error) {
      console.error('Error saving rooms to storage:', error);
    }
  }

  private syncWithStorage() {
    // Poll for changes from other tabs every 1 second
    setInterval(() => {
      const currentRooms = this.getRooms();
      currentRooms.forEach((data, path) => {
        this.notifyListeners(path, data);
      });
    }, 1000);
  }

  ref(path: string) {
    return {
      set: async (data: any) => {
        const rooms = this.getRooms();
        rooms.set(path, data);
        this.saveRooms(rooms);
        this.notifyListeners(path, data);
      },
      update: async (data: any) => {
        const rooms = this.getRooms();
        const existing = rooms.get(path) || {};
        const updated = { ...existing, ...data };
        rooms.set(path, updated);
        this.saveRooms(rooms);
        this.notifyListeners(path, updated);
      },
      on: (event: string, callback: Function) => {
        if (!this.listeners.has(path)) {
          this.listeners.set(path, []);
        }
        this.listeners.get(path)!.push(callback);
        
        // Immediately call with existing data
        const rooms = this.getRooms();
        const data = rooms.get(path);
        if (data) {
          callback({ val: () => data });
        }
        
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
      },
      once: async (event: string) => {
        const rooms = this.getRooms();
        const data = rooms.get(path);
        return { val: () => data };
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
