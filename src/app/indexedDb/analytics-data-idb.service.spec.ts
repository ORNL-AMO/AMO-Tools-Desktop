import { TestBed } from '@angular/core/testing';

import { AnalyticsDataIdbService } from './analytics-data-idb.service';

describe('AnalyticsDataIdbService', () => {
  let service: AnalyticsDataIdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsDataIdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
