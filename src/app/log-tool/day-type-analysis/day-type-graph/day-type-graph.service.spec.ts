import { TestBed } from '@angular/core/testing';

import { DayTypeGraphService } from './day-type-graph.service';

describe('DayTypeGraphService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DayTypeGraphService = TestBed.get(DayTypeGraphService);
    expect(service).toBeTruthy();
  });
});
