import { Room, Client } from '@colyseus/core';
import { MyRoomState } from './schema/MyRoomState';
import { GameLogic } from './GameLogic';

export class Messages {
  constructor(private room: Room<MyRoomState>, private gameLogic: GameLogic) {
    this.registerMessageHandlers();
  }

  private registerMessageHandlers(): void {
    this.room.onMessage('setUsername', this.handleSetUsername.bind(this));
    this.room.onMessage('playerReady', this.handlePlayerReady.bind(this));
    this.room.onMessage('playCard', this.handlePlayCard.bind(this));
    this.room.onMessage('drawCard', this.handleDrawCard.bind(this));
    // Add more message handlers as needed
  }

  private handleSetUsername(client: Client, message: any): void {
    const player = this.room.state.players.get(client.sessionId);
    if (player) {
      player.name = message.username;
      this.room.broadcast('notification', {
        text: `${message.username} joined the game!`,
      });
    }
  }

  private handlePlayerReady(client: Client): void {
    const player = this.room.state.players.get(client.sessionId);
    if (player) {
      player.isReady = true;
      this.room.broadcast('notification', {
        text: `${player.name} is ready!`,
      });
      // Check if all players are ready to start the game
      if (this.gameLogic.areAllPlayersReady()) {
        this.gameLogic.startGame();
      }
    }
  }

  private handlePlayCard(client: Client, message: any): void {
    const player = this.room.state.players.get(client.sessionId);
    if (player && this.room.state.currentTurnPlayerId === client.sessionId) {
      // Validate and play card (logic to be implemented)
      this.room.broadcast('notification', {
        text: `${player.name} played a card!`,
      });

      // Move to next turn
      this.gameLogic.nextTurn();
    }
  }

  private handleDrawCard(client: Client): void {
    const player = this.room.state.players.get(client.sessionId);
    if (player && this.room.state.currentTurnPlayerId === client.sessionId) {
      // Draw logic to be implemented
      this.room.broadcast('notification', {
        text: `${player.name} drew a card!`,
      });
    }
  }
}
