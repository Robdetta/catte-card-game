import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-slot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-slot.html',
  styleUrls: ['./player-slot.scss'],
})
export class PlayerSlotComponent {
  @Input() player: any;
  @Input() position: string = 'top'; // top, top-left, top-right, left, right, bottom
  @Input() isCurrentTurn: boolean = false;
  @Input() isMainPlayer: boolean = false;

  get cardsCount(): number {
    return this.player?.hand?.length || 0;
  }

  get playerStatus(): string {
    if (this.isCurrentTurn) return 'Playing';
    if (this.player?.isReady) return 'Ready';
    return 'Waiting';
  }
}
