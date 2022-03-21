import { TestBed } from '@angular/core/testing';

import { Co2SavingsPhastService } from './co2-savings-phast.service';

describe('Co2SavingsPhastService', () => {
  let service: Co2SavingsPhastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Co2SavingsPhastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
