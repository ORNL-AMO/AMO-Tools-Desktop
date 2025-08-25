import { TestBed } from '@angular/core/testing';

import { ChillerLoadScheduleService } from './chiller-load-schedule.service';

describe('ChillerLoadScheduleService', () => {
  let service: ChillerLoadScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerLoadScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
