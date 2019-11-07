import { TestBed } from '@angular/core/testing';

import { PneumaticAirService } from './pneumatic-air.service';

describe('PneumaticAirService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PneumaticAirService = TestBed.get(PneumaticAirService);
    expect(service).toBeTruthy();
  });
});
