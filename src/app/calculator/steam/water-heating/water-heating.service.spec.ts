import { TestBed } from '@angular/core/testing';

import { WaterHeatingService } from './water-heating.service';

describe('WaterHeatingService', () => {
  let service: WaterHeatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterHeatingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
