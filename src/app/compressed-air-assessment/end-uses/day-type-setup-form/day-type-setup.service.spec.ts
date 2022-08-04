import { TestBed } from '@angular/core/testing';

import { DayTypeSetupService } from './day-type-setup.service';

describe('DayTypeSetupService', () => {
  let service: DayTypeSetupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DayTypeSetupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
