import { TestBed } from '@angular/core/testing';

import { CompressedAirMotorIntegrationService } from './compressed-air-motor-integration.service';

describe('CompressedAirMotorIntegrationService', () => {
  let service: CompressedAirMotorIntegrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressedAirMotorIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
