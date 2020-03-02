import { TestBed } from '@angular/core/testing';

import { RollupPrintService } from './rollup-print.service';

describe('RollupPrintService', () => {
  let service: RollupPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RollupPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
