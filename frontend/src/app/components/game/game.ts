import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColyseusService } from '../../services/colyseus';
import { PlayerSlotComponent } from '../player-slot/player-slot';
import { PlayerHandComponent } from '../player-hand/player-hand';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSlotComponent, PlayerHandComponent],
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  gameKey: string | null = null;
  players: any[] = [];
  username: string = '';
  usernameSet: boolean = false;
  currentTurnPlayerId: string | null = null;
  currentTurnPlayerName: string = '';
  currentPlayerSessionId: string | null = null;
  myHand: string[] = [];
  playedCards: any[] = [];
  notifications: string[] = [];
  gameState: string = 'waiting';

  private destroy$ = new Subject<void>();
  private room: any;
  private notificationTimers: Map<string, any> = new Map();

  constructor(
    private colyseusService: ColyseusService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.gameKey = params['gameKey'];
      this.initializeGame();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Clear all notification timers
    this.notificationTimers.forEach((timer) => clearTimeout(timer));
    this.colyseusService.leaveRoom();
  }

  private initializeGame(): void {
    this.room = this.colyseusService.getRoom();
    this.currentPlayerSessionId = this.room?.sessionId;

    this.colyseusService.roomState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state) {
        this.updateGameState(state);
      }
    });

    this.colyseusService.players$.pipe(takeUntil(this.destroy$)).subscribe((players) => {
      this.players = players || [];

      console.log('👥 Players updated:', this.players.length);
      this.players.forEach((p, i) => {
        console.log(`  Player ${i}: ${p.name} - Hand:`, p.hand);
      });

      if (this.players.length > 0 && this.room) {
        const myPlayer = this.players.find((p) => p.id === this.room.sessionId);
        if (myPlayer && myPlayer.hand) {
          this.myHand = Array.from(myPlayer.hand);
          console.log('🎴 My hand:', this.myHand);
        }
      }

      this.updateCurrentTurnPlayerName();
    });
  }

  private updateGameState(state: any): void {
    if (state.currentTurnPlayerId) {
      this.currentTurnPlayerId = state.currentTurnPlayerId;
      this.updateCurrentTurnPlayerName();
    }

    if (state.gameState) {
      this.gameState = state.gameState;
      if (state.gameState === 'playing') {
        this.addNotification('🎮 Game has started!');
      }
    }
  }

  private updateCurrentTurnPlayerName(): void {
    if (this.currentTurnPlayerId && this.players.length > 0) {
      const currentPlayer = this.players.find((p) => p.id === this.currentTurnPlayerId);
      this.currentTurnPlayerName = currentPlayer?.name || 'Unknown Player';
    }
  }

  setUsername(): void {
    if (!this.username.trim()) {
      alert('Please enter a username');
      return;
    }

    if (this.room) {
      this.room.send('setUsername', { username: this.username });
      this.usernameSet = true;
      this.addNotification(`✅ Your name is now: ${this.username}`);
    }
  }

  playerReady(): void {
    if (this.room) {
      this.room.send('playerReady');
      this.addNotification('👍 You are ready!');
    }
  }

  addNotification(message: string): void {
    this.notifications.unshift(message);

    // Keep only last 5 notifications
    if (this.notifications.length > 5) {
      const removed = this.notifications.pop();
      // Clear any existing timer for this notification
      if (removed && this.notificationTimers.has(removed)) {
        clearTimeout(this.notificationTimers.get(removed));
        this.notificationTimers.delete(removed);
      }
    }

    // Auto-remove notification after 5 seconds
    const timer = setTimeout(() => {
      const index = this.notifications.indexOf(message);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
      this.notificationTimers.delete(message);
    }, 5000);

    this.notificationTimers.set(message, timer);
  }

  leaveGame(): void {
    this.colyseusService.leaveRoom();
    this.router.navigate(['/']);
  }

  isCurrentTurn(playerId: string): boolean {
    return playerId === this.currentTurnPlayerId;
  }

  getPositionForIndex(index: number): string {
    const positions = ['bottom', 'top', 'top-left', 'top-right', 'left', 'right'];
    return positions[index] || 'top';
  }

  getOrderedPlayers(): any[] {
    if (!this.currentPlayerSessionId || this.players.length === 0) {
      return this.players;
    }

    // Put local player LAST (for bottom position)
    const me = this.players.find((p) => p.id === this.currentPlayerSessionId);
    const others = this.players.filter((p) => p.id !== this.currentPlayerSessionId);

    console.log('🎮 Local player last:', me?.name);
    return me ? [...others, me] : this.players;
  }
}
