import { TestBed } from '@angular/core/testing';

import { TreasureHuntCalculatorService } from './treasure-hunt-calculator.service';

describe('TreasureHuntCalculatorService', () => {
  let service: TreasureHuntCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreasureHuntCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
