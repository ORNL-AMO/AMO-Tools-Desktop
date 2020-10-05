import { TestBed } from '@angular/core/testing';

import { MotorInventoryService } from './motor-inventory.service';

describe('MotorInventoryService', () => {
  let service: MotorInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
