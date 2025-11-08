import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CardFrame {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
}

export interface Card {
  id: string; // e.g., "clubs2", "hearts10", "spadesAce"
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
}

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private cardsData: Map<string, Card> = new Map();
  private cardsLoaded$ = new BehaviorSubject<boolean>(false);
  private atlasWidth = 1564;
  private atlasHeight = 962;

  constructor(private http: HttpClient) {
    this.loadCards();
  }

  private loadCards(): void {
    this.http.get<any>('assets/cards.json').subscribe((data) => {
      if (data.frames && Array.isArray(data.frames)) {
        data.frames.forEach((frameData: any) => {
          const card: Card = {
            id: frameData.filename,
            filename: frameData.filename,
            frame: frameData.frame,
          };
          this.cardsData.set(frameData.filename, card);
        });
      }
      this.cardsLoaded$.next(true);
      console.log('Cards loaded:', this.cardsData.size);
    });
  }

  getCard(cardId: string): Card | undefined {
    return this.cardsData.get(cardId);
  }

  isLoaded(): Observable<boolean> {
    return this.cardsLoaded$.asObservable();
  }

  getAtlasWidth(): number {
    return this.atlasWidth;
  }

  getAtlasHeight(): number {
    return this.atlasHeight;
  }
}
