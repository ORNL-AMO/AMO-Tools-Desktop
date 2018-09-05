import { TestBed, inject } from '@angular/core/testing';

import { FanService } from './fan.service';

describe('FanService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FanService]
    });
  });

  it('should be created', inject([FanService], (service: FanService) => {
    expect(service).toBeTruthy();
  }));
});
