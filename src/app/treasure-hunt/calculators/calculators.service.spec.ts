import { TestBed } from '@angular/core/testing';

import { CalculatorsService } from './calculators.service';

describe('CalculatorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalculatorsService = TestBed.get(CalculatorsService);
    expect(service).toBeTruthy();
  });
});
