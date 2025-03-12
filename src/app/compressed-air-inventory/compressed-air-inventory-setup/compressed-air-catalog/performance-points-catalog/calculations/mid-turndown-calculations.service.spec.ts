import { TestBed } from '@angular/core/testing';

import { MidTurndownCalculationsService } from './mid-turndown-calculations.service';

describe('MidTurndownCalculationsService', () => {
  let service: MidTurndownCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MidTurndownCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
