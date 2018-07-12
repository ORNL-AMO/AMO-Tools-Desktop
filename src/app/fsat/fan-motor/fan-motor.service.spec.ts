import { TestBed, inject } from '@angular/core/testing';

import { FanMotorService } from './fan-motor.service';

describe('FanMotorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FanMotorService]
    });
  });

  it('should be created', inject([FanMotorService], (service: FanMotorService) => {
    expect(service).toBeTruthy();
  }));
});
