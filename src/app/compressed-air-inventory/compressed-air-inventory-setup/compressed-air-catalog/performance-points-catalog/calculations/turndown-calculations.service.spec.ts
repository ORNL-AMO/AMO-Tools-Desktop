import { TestBed } from '@angular/core/testing';

import { TurndownCalculationsService } from './turndown-calculations.service';

describe('TurndownCalculationsService', () => {
  let service: TurndownCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurndownCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
