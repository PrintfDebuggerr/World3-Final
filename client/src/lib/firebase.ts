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

// Mock Firebase implementation for development
class MockFirebase {
  private rooms: Map<string, any> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  async init() {
    console.log('Firebase initialized (mock mode)');
  }

  ref(path: string) {
    return {
      set: async (data: any) => {
        this.rooms.set(path, data);
        this.notifyListeners(path, data);
      },
      update: async (data: any) => {
        const existing = this.rooms.get(path) || {};
        const updated = { ...existing, ...data };
        this.rooms.set(path, updated);
        this.notifyListeners(path, updated);
      },
      on: (event: string, callback: Function) => {
        if (!this.listeners.has(path)) {
          this.listeners.set(path, []);
        }
        this.listeners.get(path)!.push(callback);
        
        // Immediately call with existing data
        const data = this.rooms.get(path);
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
        const data = this.rooms.get(path);
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
