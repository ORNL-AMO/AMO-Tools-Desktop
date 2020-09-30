import { TestBed } from '@angular/core/testing';

import { MotorBasicsService } from './motor-basics.service';

describe('MotorBasicsService', () => {
  let service: MotorBasicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorBasicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
