import { TestBed } from '@angular/core/testing';

import { NoLoadCalculationsService } from './no-load-calculations.service';

describe('NoLoadCalculationsService', () => {
  let service: NoLoadCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoLoadCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
