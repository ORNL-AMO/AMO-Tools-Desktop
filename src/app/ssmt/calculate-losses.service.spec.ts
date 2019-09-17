import { TestBed, inject } from '@angular/core/testing';

import { CalculateLossesService } from './calculate-losses.service';

describe('CalculateLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalculateLossesService]
    });
  });

  it('should be created', inject([CalculateLossesService], (service: CalculateLossesService) => {
    expect(service).toBeTruthy();
  }));
});
