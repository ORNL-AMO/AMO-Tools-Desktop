import { TestBed } from '@angular/core/testing';

import { ConvertProcessCoolingService } from './convert-process-cooling.service';

describe('ConvertProcessCoolingService', () => {
  let service: ConvertProcessCoolingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertProcessCoolingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
