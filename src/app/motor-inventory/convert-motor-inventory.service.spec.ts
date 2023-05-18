import { TestBed } from '@angular/core/testing';

import { ConvertMotorInventoryService } from './convert-motor-inventory.service';

describe('ConvertMotorInventoryService', () => {
  let service: ConvertMotorInventoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConvertMotorInventoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
