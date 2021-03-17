import { TestBed } from '@angular/core/testing';

import { SystemBasicsService } from './system-basics.service';

describe('SystemBasicsService', () => {
  let service: SystemBasicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemBasicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
