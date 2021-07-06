import { TestBed } from '@angular/core/testing';

import { FullLoadCalculationsService } from './full-load-calculations.service';

describe('FullLoadCalculationsService', () => {
  let service: FullLoadCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FullLoadCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
