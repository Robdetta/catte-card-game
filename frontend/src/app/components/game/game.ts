import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColyseusService } from '../../services/colyseus';
import { PlayerSlotComponent } from '../player-slot/player-slot';
import { PlayerHand } from '../player-hand/player-hand';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSlotComponent, PlayerHand],
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  gameKey: string | null = null;
  players: any[] = [];
  username: string = '';
  usernameSet: boolean = false;
  currentTurnPlayerId: string | null = null;
  currentPlayerSessionId: string | null = null;
  myHand: string[] = [];
  playedCards: any[] = [];
  notifications: string[] = [];

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

    // Subscribe to game state changes
    this.colyseusService.roomState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state) {
        this.updateGameState(state);
      }
    });

    // Subscribe to players
    this.colyseusService.players$.pipe(takeUntil(this.destroy$)).subscribe((players) => {
      this.players = players || [];
      // Update my hand if I'm in the players array
      if (this.players.length > 0 && this.room) {
        const myPlayer = this.players.find((p) => p.id === this.room.sessionId);
        if (myPlayer && myPlayer.hand) {
          this.myHand = Array.from(myPlayer.hand);
        }
      }
    });
  }

  private updateGameState(state: any): void {
    if (state.currentTurnPlayerId) {
      this.currentTurnPlayerId = state.currentTurnPlayerId;
    }

    if (state.gameState === 'playing') {
      this.addNotification('Game has started!');
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
      this.addNotification(`Your name is now: ${this.username}`);
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
