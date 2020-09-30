import { TestBed } from '@angular/core/testing';

import { FanPsychrometricService } from './fan-psychrometric.service';

describe('FanPsychrometricService', () => {
  let service: FanPsychrometricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FanPsychrometricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
