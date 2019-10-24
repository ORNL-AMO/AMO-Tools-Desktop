import { TestBed } from '@angular/core/testing';

import { AirVelocityService } from './air-velocity.service';

describe('AirVelocityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AirVelocityService = TestBed.get(AirVelocityService);
    expect(service).toBeTruthy();
  });
});
