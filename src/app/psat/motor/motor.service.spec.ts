import { TestBed, inject } from '@angular/core/testing';

import { MotorService } from './motor.service';

describe('MotorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MotorService]
    });
  });

  it('should be created', inject([MotorService], (service: MotorService) => {
    expect(service).toBeTruthy();
  }));
});
