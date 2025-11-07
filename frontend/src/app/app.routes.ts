import { Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby';
import { GameComponent } from './components/game/game';

export const routes: Routes = [
  { path: '', component: LobbyComponent },
  { path: 'game/:gameKey', component: GameComponent },
  { path: '**', redirectTo: '' },
];
