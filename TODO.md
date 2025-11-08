1. Game Room UI Design
   Layout:
   6 player slots (1 main player at the center/bottom, 5 others in a circle around).
   Show player names, avatars, cards in hand, and status (active/ready/turn).
   Center area for game actions (played cards, notifications, etc.).
   Display whose turn it is.
   Show game PIN and room info.
2. Game Logic & Turn System
   Player Management:

Join/leave handling.
Assign seat positions.
Indicate current player’s turn.
Turn System:

Track and update whose turn it is.
Handle turn transitions (next player, skip, etc.).
Game Rules:

Implement card dealing, playing, and round logic.
Validate moves according to game rules.
Handle win/loss conditions. 3. Backend Integration
State Sync:

Sync game state (players, cards, turn info) from backend.
Listen for backend events (turn change, card played, etc.).
Actions:

Send player actions (play card, ready, etc.) to backend.
Receive updates and reflect in UI. 4. Frontend Implementation Steps
Design UI mockup for the game room (sketch or Figma).
Create Angular game component with player slots and center area.
Wire up Colyseus state sync to update UI in real time.
Implement turn indicator and player actions (buttons, card selection).
Handle game events (turn change, card played, round end).
Test with multiple clients to ensure sync and UI correctness. 5. Backend Implementation Steps
Expand room state to track player positions, cards, turn.
Implement turn logic (next player, skip, etc.).
Add game rule enforcement (valid moves, win/loss).
Send state updates and events to clients.
Handle edge cases (disconnects, timeouts). 6. Testing & Iteration
Test with 2–6 players.
Refine UI and UX.
Polish game logic and error handling.
Summary:

Start with UI mockup and component structure.
Sync with backend state.
Implement turn system and game rules.
Test and iterate.
