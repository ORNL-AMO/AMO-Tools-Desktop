import { TestBed } from '@angular/core/testing';

import { SystemProfileGraphsService } from './system-profile-graphs.service';

describe('SystemProfileGraphsService', () => {
  let service: SystemProfileGraphsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemProfileGraphsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
