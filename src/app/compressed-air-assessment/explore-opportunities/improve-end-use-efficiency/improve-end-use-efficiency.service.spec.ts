import { TestBed } from '@angular/core/testing';

import { ImproveEndUseEfficiencyService } from './improve-end-use-efficiency.service';

describe('ImproveEndUseEfficiencyService', () => {
  let service: ImproveEndUseEfficiencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImproveEndUseEfficiencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
