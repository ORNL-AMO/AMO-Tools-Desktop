import { TestBed, inject } from '@angular/core/testing';

import { FanFieldDataService } from './fan-field-data.service';

describe('FanFieldDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FanFieldDataService]
    });
  });

  it('should be created', inject([FanFieldDataService], (service: FanFieldDataService) => {
    expect(service).toBeTruthy();
  }));
});
