import { TestBed } from '@angular/core/testing';

import { IntegrationStateService } from './integration-state.service';

describe('IntegrationStateService', () => {
  let service: IntegrationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntegrationStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
