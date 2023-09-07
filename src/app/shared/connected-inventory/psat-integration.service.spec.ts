import { TestBed } from '@angular/core/testing';

import { PsatIntegrationService } from './psat-integration.service';

describe('PsatIntegrationService', () => {
  let service: PsatIntegrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PsatIntegrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
