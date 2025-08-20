# Wordle Duo - Turkish Multiplayer Word Game

## Overview

Wordle Duo is a Turkish multiplayer word game that allows two players to play Wordle-style word guessing games together. The application features two distinct game modes: Sequential Mode (where players take turns on the same board) and Duel Mode (where players compete on separate boards simultaneously). Built with modern web technologies, it provides real-time multiplayer functionality with an elegant dark-themed UI featuring Turkish flag-inspired color accents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, leveraging Vite as the build tool. The application follows a component-based architecture with:

- **State Management**: Uses Zustand for global state management with subscriptions for real-time updates
- **UI Framework**: Custom component library built on top of Radix UI primitives with Tailwind CSS for styling
- **Animation System**: Framer Motion for smooth transitions and interactive animations
- **Routing**: Single-page application with programmatic navigation through game states

### Game State Management
The application manages complex game states through a centralized store pattern:

- **Game Phases**: Menu, waiting, playing, and finished states
- **Player Management**: Real-time player status tracking and avatar assignment
- **Room Management**: Dynamic room creation with 6-character alphanumeric codes
- **Turn-based Logic**: Sequential turn management for collaborative gameplay

### Real-time Communication
WebSocket-based communication enables live multiplayer functionality:

- **Room Synchronization**: Real-time updates of game state across connected players
- **Player Presence**: Live connection status and disconnection handling
- **Game Progress**: Instant propagation of moves and game events

### Backend Architecture
Express.js server with WebSocket integration provides:

- **RESTful API**: Health checks and room information endpoints
- **WebSocket Server**: Real-time bidirectional communication using ws library
- **In-memory Storage**: Game rooms and player connections stored in memory for fast access
- **Room Management**: Dynamic room creation, joining, and cleanup

### UI/UX Design System
Turkish-themed design with glassmorphism effects:

- **Color Palette**: Turkish flag colors (red/white) with neon accents for interactive elements
- **Typography**: Inter font family for clean, modern readability
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Animation Library**: Custom CSS animations for letter flips, pulses, and confetti effects

### Game Logic Implementation
Core Wordle mechanics adapted for multiplayer:

- **Word Validation**: Turkish 5-letter word dictionary with comprehensive validation
- **Letter Status System**: Color-coded feedback (correct, present, absent) with keyboard state tracking
- **Game Modes**: 
  - Sequential: Shared board with alternating turns
  - Duel: Separate boards with simultaneous play and color-only opponent feedback

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and concurrent features
- **TypeScript**: Type safety and enhanced developer experience
- **Vite**: Fast build tool with hot module replacement
- **Express.js**: Backend web framework for API and WebSocket server

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Radix UI**: Headless UI primitives for accessible components
- **Framer Motion**: Animation library for smooth transitions and effects
- **Lucide React**: Icon library for consistent iconography

### Real-time Communication
- **WebSocket (ws)**: Server-side WebSocket implementation for real-time features
- **Native WebSocket API**: Client-side real-time communication

### State Management and Data
- **Zustand**: Lightweight state management with TypeScript support
- **TanStack Query**: Server state management and caching (configured but minimal usage)

### Development and Build Tools
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **TSX**: TypeScript execution for development server

### Database Configuration
- **Drizzle ORM**: Database toolkit configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL integration ready for scaling

### Optional Integrations
- **Firebase**: Mock implementation included for potential real-time database features
- **Three.js**: 3D graphics libraries imported but not actively used in current implementation

The application is architected to scale from the current in-memory implementation to persistent database storage and distributed systems as needed.