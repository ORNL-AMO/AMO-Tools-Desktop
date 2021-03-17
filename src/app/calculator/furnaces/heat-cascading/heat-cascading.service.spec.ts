import { TestBed } from '@angular/core/testing';

import { HeatCascadingService } from './heat-cascading.service';

describe('HeatCascadingService', () => {
  let service: HeatCascadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeatCascadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
