import { TestBed } from '@angular/core/testing';

import { WaterSystemComponentService } from './water-system-component.service';

describe('WaterSystemComponentService', () => {
  let service: WaterSystemComponentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterSystemComponentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
