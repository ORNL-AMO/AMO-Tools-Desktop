import { TestBed } from '@angular/core/testing';

import { FanSystemChecklistService } from './fan-system-checklist.service';

describe('FanSystemChecklistService', () => {
  let service: FanSystemChecklistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FanSystemChecklistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
