import { TestBed } from '@angular/core/testing';

import { SystemProfileService } from './system-profile.service';

describe('SystemProfileService', () => {
  let service: SystemProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
