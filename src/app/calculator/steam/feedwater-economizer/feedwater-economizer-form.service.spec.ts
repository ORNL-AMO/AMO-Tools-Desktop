import { TestBed } from '@angular/core/testing';

import { FeedwaterEconomizerFormService } from './feedwater-economizer-form.service';

describe('FeedwaterEconomizerFormService', () => {
  let service: FeedwaterEconomizerFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedwaterEconomizerFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
