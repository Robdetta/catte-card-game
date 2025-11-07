# Catte Card Game

A multiplayer card game inspired by Blackjack, built with Angular and Colyseus.

## Project Overview

- **Frontend**: Angular application
- **Backend**: Colyseus game server
- **Max Players**: 6 players per room
- **Room Access**: 4-digit PIN code system

## Project Structure

```
catte-card-game/
├── frontend/          # Angular application
├── backend/           # Colyseus server
└── README.md
```

## Setup Steps

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### 1. Frontend Setup (Angular)

```bash
cd frontend
npm install
ng serve
```

Access at: http://localhost:4200

### 2. Backend Setup (Colyseus)

```bash
cd backend
npm install
npm start
```

Server runs at: http://localhost:2567

## Development Roadmap

### Phase 1: Project Infrastructure ✓

- [x] Create Angular frontend project
- [x] Create Colyseus backend project
- [x] Setup basic README

### Phase 2: Core Backend Features

- [ ] Create game room schema
- [ ] Implement 4-digit PIN room creation/joining
- [ ] Setup player state management
- [ ] Implement card deck logic
- [ ] Create game state management (similar to Blackjack)

### Phase 3: Frontend UI

- [ ] Design table layout (6 player positions)
- [ ] Create lobby/room joining interface
- [ ] Implement PIN code input system
- [ ] Build card display components
- [ ] Create player hand display
- [ ] Add dealer position UI

### Phase 4: Game Logic

- [ ] Connect frontend to Colyseus backend
- [ ] Implement card dealing mechanics
- [ ] Add player turn management
- [ ] Implement betting system (if applicable)
- [ ] Add win/loss conditions

### Phase 5: Polish & Deployment

- [ ] Add animations
- [ ] Implement responsive design
- [ ] Testing
- [ ] Deploy to free hosting (Render.com, Railway.app, or Vercel)

## Deployment Options (Free Tier)

### Backend Options:

- **Render.com**: Free tier with 750 hours/month
- **Railway.app**: $5 free credit monthly
- **Fly.io**: Free tier available

### Frontend Options:

- **Vercel**: Free for frontend applications
- **Netlify**: Free tier with generous limits
- **GitHub Pages**: Free static hosting

## Game Rules (Blackjack-inspired)

_To be documented as game mechanics are implemented_

## Tech Stack

- **Frontend**: Angular 17+, TypeScript, SCSS
- **Backend**: Colyseus, Node.js, TypeScript
- **WebSocket**: Real-time multiplayer communication

## Contributing

This is a personal project. Feel free to fork and modify!

## License

MIT
