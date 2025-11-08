import { Room, Client } from '@colyseus/core';
import { ArraySchema } from '@colyseus/schema';
import { MyRoomState } from './schema/MyRoomState';
import { generateGameKey } from './GameKeyGenerator';
import { Player } from './Player';
import { generateShuffleDeck } from './schema/CardOperations';
import { GameLogic } from './GameLogic';
import { Messages } from './Messages';
import { dealCards } from './DeckMechanics';

export class CardGameRoom extends Room<MyRoomState> {
  maxClients = 6;
  gameKey: string;
  private gameLogic: GameLogic;
  private messages: Messages;

  onCreate(options: any) {
    this.maxClients = options.numPlayers + options.numBots;

    if (this.maxClients < 1 || this.maxClients > 6) {
      throw new Error('Total players must be between 1 and 6');
    }

    // if (options.numPlayers + options.numBots < 1) {
    //   throw new Error('Must have at least one player or bot.');
    // }

    // if (options.numPlayers + options.numBots > 6) {
    //   throw new Error('Total number of players and bots should not exceed 6.');
    // }

    this.state = new MyRoomState();
    this.state.deck = new ArraySchema(...generateShuffleDeck());
    this.state.gameState = 'waiting';
    this.state.numBots = options.numBots;

    // Generate gameKey and set as roomId
    this.gameKey = generateGameKey();
    this.roomId = this.gameKey;
    this.state.gameKey = this.gameKey;

    this.gameLogic = new GameLogic(this.state);
    this.messages = new Messages(this, this.gameLogic);

    this.broadcast('notification', {
      text: 'Game created. Waiting for players to join...',
    });
    console.log(`Room created: ${this.gameKey}`);
  }

  onJoin(client: Client): void {
    //const totalClients = this.state.numPlayers + this.state.numBots;
    const totalPlayers = this.state.players.size;

    // if (totalClients >= this.maxClients) {
    //   throw new Error('Room is full!');
    // }
    if (totalPlayers >= this.maxClients) {
      throw new Error('Room is full!');
    }

    console.log(client.sessionId, 'joined!');

    //create new player
    const newPlayer = new Player();
    newPlayer.id = client.sessionId;
    newPlayer.name = `Player ${totalPlayers + 1}`;
    newPlayer.seatPosition = totalPlayers; // Assign seat position (0-5)
    newPlayer.hand = new ArraySchema<string>();

    //add new state
    this.state.players.set(client.sessionId, newPlayer);
    this.state.numPlayers++;

    this.broadcast('notification', {
      text: `${newPlayer.name} joined the game.`,
    });
    console.log(
      `${client.sessionId} joined. Total: ${this.state.players.size}`,
    );
  }

  onLeave(client: Client): void {
    console.log(client.sessionId, 'left!');
    const player = this.state.players.get(client.sessionId);

    if (player) {
      this.broadcast('notification', {
        text: `${player.name} left the game.`,
      });
    }

    this.state.players.delete(client.sessionId);
    this.state.numPlayers--;

    console.log(
      `${client.sessionId} left. Remaining: ${this.state.players.size}`,
    );
  }

  onDispose() {
    console.log('Room', this.roomId, 'disposed');
  }
}
