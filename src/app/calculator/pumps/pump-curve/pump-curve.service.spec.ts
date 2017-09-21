import { TestBed, inject } from '@angular/core/testing';

import { PumpCurveService } from './pump-curve.service';

describe('PumpCurveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PumpCurveService]
    });
  });

  it('should be created', inject([PumpCurveService], (service: PumpCurveService) => {
    expect(service).toBeTruthy();
  }));
});
