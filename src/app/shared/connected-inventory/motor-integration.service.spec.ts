import { TestBed } from '@angular/core/testing';

import { MotorIntegrationService } from './motor-integration.service';

describe('MotorIntegrationService', () => {
  let service: MotorIntegrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
