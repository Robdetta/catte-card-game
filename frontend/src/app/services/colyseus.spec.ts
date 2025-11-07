import { TestBed } from '@angular/core/testing';

import { Colyseus } from './colyseus';

describe('Colyseus', () => {
  let service: Colyseus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Colyseus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
