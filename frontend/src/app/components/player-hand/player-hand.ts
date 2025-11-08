import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardService } from '../../services/CardService';

@Component({
  selector: 'app-player-hand',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-hand.html',
  styleUrl: './player-hand.scss',
})
export class PlayerHand implements OnInit, OnChanges {
  @Input() cardIds: string[] = [];
  @Input() isMyHand: boolean = false;

  cards: any[] = [];
  cardsLoaded: boolean = false;

  constructor(private cardService: CardService) {}

  ngOnInit(): void {
    this.cardService.isLoaded().subscribe((loaded) => {
      this.cardsLoaded = loaded;
      if (loaded) {
        this.loadCards();
      }
    });
  }

  ngOnChanges(): void {
    if (this.cardsLoaded) {
      this.loadCards();
    }
  }

  private loadCards(): void {
    this.cards = this.cardIds.map((cardId) => {
      return this.cardService.getCard(cardId);
    });
  }

  getCardStyle(card: any) {
    if (!card || !card.frame) return {};

    const frame = card.frame;
    const atlasWidth = this.cardService.getAtlasWidth();
    const atlasHeight = this.cardService.getAtlasHeight();

    return {
      backgroundImage: 'url(assets/cards.png)',
      backgroundPosition: `-${frame.x}px -${frame.y}px`,
      backgroundSize: `${atlasWidth}px ${atlasHeight}px`,
      width: `${frame.w}px`,
      height: `${frame.h}px`,
    };
  }

  getCardBackStyle() {
    // Show back card
    const backCard = this.cardService.getCard('back');
    if (!backCard || !backCard.frame) return {};

    const frame = backCard.frame;
    const atlasWidth = this.cardService.getAtlasWidth();
    const atlasHeight = this.cardService.getAtlasHeight();

    return {
      backgroundImage: 'url(assets/cards.png)',
      backgroundPosition: `-${frame.x}px -${frame.y}px`,
      backgroundSize: `${atlasWidth}px ${atlasHeight}px`,
      width: `${frame.w}px`,
      height: `${frame.h}px`,
    };
  }
}
