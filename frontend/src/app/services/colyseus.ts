import { Injectable } from '@angular/core';
import * as Colyseus from 'colyseus.js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ColyseusService {
  private client: Colyseus.Client;
  private room: Colyseus.Room | null = null;
  private gameKeySubject = new BehaviorSubject<string | null>(null);
  private playersSubject = new BehaviorSubject<any[]>([]);
  private roomStateSubject = new BehaviorSubject<any>(null);

  gameKey$ = this.gameKeySubject.asObservable();
  players$ = this.playersSubject.asObservable();
  roomState$ = this.roomStateSubject.asObservable();

  constructor() {
    this.client = new Colyseus.Client(environment.wsUrl);
    console.log('Colyseus client initialized with URL:', environment.wsUrl);
  }

  async createRoom(numPlayers: number, numBots: number): Promise<string> {
    try {
      this.room = await this.client.create('card_game', {
        numPlayers,
        numBots,
      });

      this.setupRoomListeners();

      // Use roomId directly since it's set on the backend
      const gameKey = this.room.roomId;
      this.gameKeySubject.next(gameKey);
      console.log('Created room with PIN:', gameKey);
      console.log('Room ID:', this.room.roomId);

      return gameKey;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }

  async joinRoom(gameKey: string): Promise<void> {
    try {
      console.log('Attempting to join room with PIN:', gameKey);

      // Join directly using the gameKey as the roomId
      // joinById only takes the roomId, not the room name!
      this.room = await this.client.joinById(gameKey);

      this.setupRoomListeners();
      this.gameKeySubject.next(gameKey);
      console.log('Successfully joined room with PIN:', gameKey);
    } catch (error: any) {
      console.error('Failed to join room - Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);

      // More specific error handling
      if (error.message.includes('not found')) {
        throw new Error(
          `Room with PIN "${gameKey}" not found. Make sure the room creator hasn't left.`
        );
      } else if (error.message.includes('full')) {
        throw new Error('This room is full!');
      } else {
        throw new Error(`Connection error: ${error.message}`);
      }
    }
  }

  private setupRoomListeners(): void {
    if (!this.room) return;

    this.room.onStateChange((state) => {
      console.log('Room state changed:', state);
      this.roomStateSubject.next(state);
      if (state.players) {
        this.playersSubject.next(Array.from(state.players.values()));
      }
    });

    this.room.onMessage('notification', (message) => {
      console.log('Notification:', message);
    });

    this.room.onMessage('gameStart', (message) => {
      console.log('Game started:', message);
    });

    this.room.onMessage('turnChange', (message) => {
      console.log('Turn changed:', message);
    });
  }

  playerReady(): void {
    if (this.room) {
      this.room.send('playerReady');
    }
  }

  leaveRoom(): void {
    if (this.room) {
      this.room.leave();
      this.room = null;
      this.gameKeySubject.next(null);
    }
  }

  getRoom(): Colyseus.Room | null {
    return this.room;
  }
}
