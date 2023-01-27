import { TestBed } from '@angular/core/testing';

import { SecurityAndPrivacyService } from './security-and-privacy.service';

describe('SecurityAndPrivacyService', () => {
  let service: SecurityAndPrivacyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecurityAndPrivacyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
