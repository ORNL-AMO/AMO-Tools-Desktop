import { TestBed } from '@angular/core/testing';

import { SystemCapacityService } from './system-capacity.service';

describe('SystemCapacityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SystemCapacityService = TestBed.get(SystemCapacityService);
    expect(service).toBeTruthy();
  });
});
