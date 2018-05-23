import { TestBed, inject } from '@angular/core/testing';

import { MotorDriveService } from './motor-drive.service';

describe('MotorDriveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MotorDriveService]
    });
  });

  it('should be created', inject([MotorDriveService], (service: MotorDriveService) => {
    expect(service).toBeTruthy();
  }));
});
