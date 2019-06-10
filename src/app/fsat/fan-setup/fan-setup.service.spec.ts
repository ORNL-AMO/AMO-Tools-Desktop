import { TestBed, inject } from '@angular/core/testing';

import { FanSetupService } from './fan-setup.service';

describe('FanSetupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FanSetupService]
    });
  });

  it('should be created', inject([FanSetupService], (service: FanSetupService) => {
    expect(service).toBeTruthy();
  }));
});
