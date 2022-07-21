import { TestBed } from '@angular/core/testing';

import { MidTurndownCalculationService } from './mid-turndown-calculation.service';

describe('MidTurndownCalculationService', () => {
  let service: MidTurndownCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MidTurndownCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
