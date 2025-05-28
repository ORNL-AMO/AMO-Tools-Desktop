import { TestBed } from '@angular/core/testing';

import { WaterUsingSystemService } from './water-using-system.service';

describe('WaterUsingSystemService', () => {
  let service: WaterUsingSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterUsingSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
