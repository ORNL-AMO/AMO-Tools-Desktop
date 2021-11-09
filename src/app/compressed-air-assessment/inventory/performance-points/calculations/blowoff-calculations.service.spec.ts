import { TestBed } from '@angular/core/testing';

import { BlowoffCalculationsService } from './blowoff-calculations.service';

describe('BlowoffCalculationsService', () => {
  let service: BlowoffCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlowoffCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
