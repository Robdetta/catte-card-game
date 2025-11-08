import { Room, Client } from '@colyseus/core';
import { ArraySchema } from '@colyseus/schema';
import { MyRoomState } from './schema/MyRoomState';
import { generateGameKey } from './GameKeyGenerator';
import { Player } from './Player';
import { generateShuffleDeck } from './schema/CardOperations';
import { dealCards } from './DeckMechanics';

export class CardGameRoom extends Room<MyRoomState> {
  maxClients = 6;
  gameKey: string;

  onCreate(options: any) {
    this.maxClients = options.numPlayers + options.numBots;

    if (options.numPlayers + options.numBots < 1) {
      throw new Error('Must have at least one player or bot.');
    }

    if (options.numPlayers + options.numBots > 6) {
      throw new Error('Total number of players and bots should not exceed 6.');
    }

    this.setState(new MyRoomState());
    this.state.deck = new ArraySchema(...generateShuffleDeck());
    this.state.gameState = 'waiting';

    // Generate gameKey and set as roomId
    this.gameKey = generateGameKey();
    this.roomId = this.gameKey;
    this.state.gameKey = this.gameKey;

    this.state.numBots = options.numBots;

    this.sendNotification('Game created. Waiting for players to join...');

    // Handle setUsername message
    this.onMessage('setUsername', (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.name = message.username;
        this.sendNotification(`${message.username} joined the game!`);
      }
    });

    this.onMessage('playerReady', (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.isReady = true;
        this.sendNotification(`${player.name} is ready!`);
        this.checkIfAllPlayersReady();
      }
    });
  }

  onJoin(client: Client, options: any) {
    const totalClients = this.state.numPlayers + this.state.numBots;

    if (totalClients >= this.maxClients) {
      throw new Error('Room is full!');
    }

    console.log(client.sessionId, 'joined!');

    const newPlayer = new Player();
    newPlayer.id = client.sessionId;
    newPlayer.name = `Player ${this.state.numPlayers + 1}`;
    newPlayer.seatPosition = this.state.numPlayers; // Assign seat position (0-5)
    newPlayer.hand = new ArraySchema<string>();

    this.state.players.set(client.sessionId, newPlayer);
    this.state.numPlayers++;

    this.sendNotification(`${newPlayer.name} joined the game.`);
    console.log('Current players:', this.state.players.size);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.sendNotification(`${player.name} left the game.`);
    }
    this.state.players.delete(client.sessionId);
    this.state.numPlayers--;
  }

  onDispose() {
    console.log('Room', this.roomId, 'disposed');
  }

  private sendNotification(text: string) {
    this.broadcast('notification', { text: text });
  }

  private checkIfAllPlayersReady(): void {
    const allReady = Array.from(this.state.players.values()).every(
      (player) => player.isReady,
    );

    if (allReady && this.state.players.size > 0) {
      this.startGame();
    }
  }

  private async startGame(): Promise<void> {
    this.state.gameState = 'playing';
    this.sendNotification('Game started!');

    // Deal cards to each player
    const players = Array.from(this.state.players.values());
    for (const player of players) {
      const hand = this.dealCardsToPlayer(6); // Deal 6 cards
      player.hand = new ArraySchema(...hand);
    }

    // Set first player as current turn
    if (players.length > 0) {
      this.state.currentTurnPlayerId = players[0].id;
      this.sendNotification(`${players[0].name}'s turn!`);
    }
  }

  private dealCardsToPlayer(numCards: number): string[] {
    const hand: string[] = [];
    for (let i = 0; i < numCards; i++) {
      if (this.state.deck.length > 0) {
        const card = this.state.deck.pop();
        hand.push(card);
      }
    }
    return hand;
  }
}
