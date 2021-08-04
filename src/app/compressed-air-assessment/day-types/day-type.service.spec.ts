import { TestBed } from '@angular/core/testing';

import { DayTypeService } from './day-type.service';

describe('DayTypeService', () => {
  let service: DayTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DayTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
