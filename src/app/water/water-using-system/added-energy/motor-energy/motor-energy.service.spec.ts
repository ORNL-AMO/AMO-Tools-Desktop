import { TestBed } from '@angular/core/testing';

import { MotorEnergyService } from './motor-energy.service';

describe('MotorEnergyService', () => {
  let service: MotorEnergyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorEnergyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
