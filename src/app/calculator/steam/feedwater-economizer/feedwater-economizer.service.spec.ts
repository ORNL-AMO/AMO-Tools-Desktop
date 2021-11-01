import { TestBed } from '@angular/core/testing';

import { FeedwaterEconomizerService } from './feedwater-economizer.service';

describe('FeedwaterEconomizerService', () => {
  let service: FeedwaterEconomizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedwaterEconomizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
