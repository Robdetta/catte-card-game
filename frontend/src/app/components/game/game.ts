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
    this.colyseusService.leaveRoom();
  }

  private initializeGame(): void {
    this.room = this.colyseusService.getRoom();
    this.currentPlayerSessionId = this.room?.sessionId;

    // Subscribe to game state changes
    this.colyseusService.roomState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state) {
        this.updateGameState(state);
      }
    });

    // Subscribe to players
    this.colyseusService.players$.pipe(takeUntil(this.destroy$)).subscribe((players) => {
      this.players = players || [];

      // Update my hand
      if (this.players.length > 0 && this.room) {
        const myPlayer = this.players.find((p) => p.id === this.room.sessionId);
        if (myPlayer && myPlayer.hand) {
          this.myHand = Array.from(myPlayer.hand);
        }
      }

      // Update current turn player name
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
    if (this.notifications.length > 5) {
      this.notifications.pop();
    }
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
}
