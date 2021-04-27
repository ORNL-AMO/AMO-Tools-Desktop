import { TestBed } from '@angular/core/testing';

import { MotorDriveTreasureHuntService } from './motor-drive-treasure-hunt.service';

describe('MotorDriveTreasureHuntService', () => {
  let service: MotorDriveTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorDriveTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
