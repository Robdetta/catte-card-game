import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Card {
  id: string;
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
    console.log('📥 Loading cards.json...');

    this.http
      .get<any>('/assets/cards.json')
      .pipe(
        tap((data) => console.log('✅ Received cards.json:', data)),
        catchError((error) => {
          console.error('❌ Failed to load cards.json:', error);
          this.cardsLoaded$.next(true);
          return of(null);
        })
      )
      .subscribe((data) => {
        if (data && data.frames && Array.isArray(data.frames)) {
          console.log(`📊 Processing ${data.frames.length} card frames...`);

          data.frames.forEach((frameData: any) => {
            const card: Card = {
              id: frameData.filename,
              filename: frameData.filename,
              frame: frameData.frame,
            };
            this.cardsData.set(frameData.filename, card);
          });

          console.log(`✅ Cards loaded: ${this.cardsData.size} total`);
          console.log('Card IDs:', Array.from(this.cardsData.keys()).slice(0, 5), '...');
        } else {
          console.warn('⚠️ No frames found in cards.json');
        }
        this.cardsLoaded$.next(true);
      });
  }

  getCard(cardId: string): Card | undefined {
    const card = this.cardsData.get(cardId);
    if (!card) {
      console.warn(`⚠️ Card not found: ${cardId}`);
    }
    return card;
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
