import { ArraySchema } from '@colyseus/schema';
import { MyRoomState } from './schema/MyRoomState';
import { Player } from './Player';

export class GameLogic {
  constructor(private state: MyRoomState) {}

  // Start the game: deal cards and set the first turn
  startGame(): void {
    this.state.gameState = 'playing';

    // Deal cards to each player
    const players = Array.from(this.state.players.values());
    for (const player of players) {
      const hand = this.dealCardsToPlayer(6);
      player.hand = new ArraySchema(...hand);
      console.log(`✅ Dealt ${hand.length} cards to ${player.name}:`, hand);
    }

    // Set first player as current turn
    if (players.length > 0) {
      this.state.currentTurnPlayerId = players[0].id;
      console.log(`🎯 Current turn: ${players[0].name}`);
    }
  }

  // Deal a number of cards from the deck
  private dealCardsToPlayer(numCards: number): string[] {
    const hand: string[] = [];
    for (let i = 0; i < numCards; i++) {
      if (this.state.deck.length > 0) {
        const card = this.state.deck.pop();
        hand.push(card);
      }
    }
    console.log(`Dealing ${numCards} cards:`, hand);
    return hand;
  }

  //move to next players turn
  nextTurn(): void {
    const players = Array.from(this.state.players.values());
    const currentIndex = players.findIndex(
      (p) => p.id === this.state.currentTurnPlayerId,
    );

    if (currentIndex !== -1) return;

    const nextIndex = (currentIndex + 1) % players.length;
    this.state.currentTurnPlayerId = players[nextIndex].id;
  }

  //Chck if all players are ready
  areAllPlayersReady(): boolean {
    const players = Array.from(this.state.players.values());
    return players.length > 0 && players.every((player) => player.isReady);
  }

  //reset player ready status for the next round
  resetPlayerReadyStatus(): void {
    this.state.players.forEach((player) => {
      player.isReady = false;
    });
  }
}
