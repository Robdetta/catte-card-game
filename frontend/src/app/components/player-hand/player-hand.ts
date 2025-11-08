import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardService } from '../../services/CardService';

@Component({
  selector: 'app-player-hand',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-hand.html',
  styleUrls: ['./player-hand.scss'],
})
export class PlayerHandComponent implements OnInit, OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardIds'] && this.cardsLoaded) {
      this.loadCards();
    }
  }

  private loadCards(): void {
    if (!this.cardIds || this.cardIds.length === 0) {
      this.cards = [];
      return;
    }

    this.cards = this.cardIds
      .map((cardId) => this.cardService.getCard(cardId))
      .filter((card) => card !== undefined);
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
    const backCard = this.cardService.getCard('back');
    if (!backCard || !backCard.frame) {
      return {
        width: '140px',
        height: '190px',
        background: '#667eea',
      };
    }

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
