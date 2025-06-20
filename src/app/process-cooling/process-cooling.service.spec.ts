import { TestBed } from '@angular/core/testing';

import { ProcessCoolingService } from './process-cooling.service';

describe('ProcessCoolingService', () => {
  let service: ProcessCoolingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessCoolingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
