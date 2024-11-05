import { TestBed } from '@angular/core/testing';

import { PowerFactorTriangleService } from './power-factor-triangle.service';

describe('PowerFactorTriangleService', () => {
  let service: PowerFactorTriangleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerFactorTriangleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
