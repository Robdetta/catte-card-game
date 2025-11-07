import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColyseusService } from '../../services/colyseus';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.scss'],
})
export class LobbyComponent {
  numPlayers = 1;
  numBots = 1;
  isLoading = false;
  gameKey: string | null = null;
  joinGameKey = '';
  errorMessage = '';

  constructor(private colyseusService: ColyseusService, private router: Router) {}

  incrementPlayers(): void {
    if (this.numPlayers + this.numBots < 6) {
      this.numPlayers++;
    }
  }

  decrementPlayers(): void {
    if (this.numPlayers > 1) {
      this.numPlayers--;
    }
  }

  incrementBots(): void {
    if (this.numPlayers + this.numBots < 6) {
      this.numBots++;
    }
  }

  decrementBots(): void {
    if (this.numBots > 0) {
      this.numBots--;
    }
  }

  async createRoom(): Promise<void> {
    if (this.numPlayers + this.numBots < 1 || this.numPlayers + this.numBots > 6) {
      this.errorMessage = 'Total players must be between 1 and 6';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const gameKey = await this.colyseusService.createRoom(this.numPlayers, this.numBots);
      this.gameKey = gameKey;
      setTimeout(() => {
        this.router.navigate(['/game', gameKey]);
      }, 2000);
    } catch (error) {
      this.errorMessage = 'Failed to create room. Make sure backend is running.';
      console.error(error);
      this.isLoading = false;
    }
  }

  async joinRoom(): Promise<void> {
    if (!this.joinGameKey.trim()) {
      this.errorMessage = 'Please enter a game PIN';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.colyseusService.joinRoom(this.joinGameKey);
      setTimeout(() => {
        this.router.navigate(['/game', this.joinGameKey]);
      }, 2000);
    } catch (error) {
      this.errorMessage = 'Failed to join room. Invalid PIN or room full.';
      console.error(error);
      this.isLoading = false;
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('PIN copied to clipboard!');
    });
  }
}
