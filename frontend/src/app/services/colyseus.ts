import { Injectable } from '@angular/core';
import * as Colyseus from 'colyseus.js';
import { BehaviorSubject, Observable } from 'rxjs';

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
    // Initialize Colyseus client - adjust URL based on your backend
    this.client = new Colyseus.Client('ws://localhost:2567');
  }

  async createRoom(numPlayers: number, numBots: number): Promise<string> {
    try {
      this.room = await this.client.create('card_game', {
        numPlayers,
        numBots,
      });

      this.setupRoomListeners();
      // Use room sessionId as gameKey
      const gameKey = this.room.sessionId;
      this.gameKeySubject.next(gameKey);

      return gameKey;
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  }

  async joinRoom(gameKey: string): Promise<void> {
    try {
      this.room = await this.client.joinById('card_game', gameKey);
      this.setupRoomListeners();
      this.gameKeySubject.next(gameKey);
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  private setupRoomListeners(): void {
    if (!this.room) return;

    this.room.onStateChange((state) => {
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
