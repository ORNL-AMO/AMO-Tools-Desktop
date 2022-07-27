import { TestBed } from '@angular/core/testing';

import { TurndownCalculationService } from './turndown-calculation.service';

describe('TurndownCalculationService', () => {
  let service: TurndownCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurndownCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
