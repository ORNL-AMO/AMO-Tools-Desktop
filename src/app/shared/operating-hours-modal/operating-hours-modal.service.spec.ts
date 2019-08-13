import { TestBed } from '@angular/core/testing';

import { OperatingHoursModalService } from './operating-hours-modal.service';

describe('OperatingHoursModalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OperatingHoursModalService = TestBed.get(OperatingHoursModalService);
    expect(service).toBeTruthy();
  });
});
