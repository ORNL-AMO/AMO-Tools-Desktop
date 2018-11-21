import { TestBed, inject } from '@angular/core/testing';

import { Co2SavingsService } from './co2-savings.service';

describe('Co2SavingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Co2SavingsService]
    });
  });

  it('should be created', inject([Co2SavingsService], (service: Co2SavingsService) => {
    expect(service).toBeTruthy();
  }));
});
