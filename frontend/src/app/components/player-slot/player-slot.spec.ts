import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerSlot } from './player-slot';

describe('PlayerSlot', () => {
  let component: PlayerSlot;
  let fixture: ComponentFixture<PlayerSlot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerSlot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerSlot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
