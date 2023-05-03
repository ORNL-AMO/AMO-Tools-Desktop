import { TestBed } from '@angular/core/testing';

import { PumpBasicsService } from './pump-basics.service';

describe('PumpBasicsService', () => {
  let service: PumpBasicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PumpBasicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
