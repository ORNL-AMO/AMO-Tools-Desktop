import { TestBed, inject } from '@angular/core/testing';

import { SystemCurveService } from './system-curve.service';

describe('SystemCurveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SystemCurveService]
    });
  });

  it('should be created', inject([SystemCurveService], (service: SystemCurveService) => {
    expect(service).toBeTruthy();
  }));
});
