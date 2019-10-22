import { TestBed } from '@angular/core/testing';

import { RegressionEquationsService } from './regression-equations.service';

describe('RegressionEquationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RegressionEquationsService = TestBed.get(RegressionEquationsService);
    expect(service).toBeTruthy();
  });
});
