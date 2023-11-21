import { TestBed } from '@angular/core/testing';

import { PhastIntegrationService } from './phast-integration.service';

describe('PhastIntegrationService', () => {
  let service: PhastIntegrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhastIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
