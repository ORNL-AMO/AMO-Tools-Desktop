import { TestBed, inject } from '@angular/core/testing';

import { ExhaustGasService } from './exhaust-gas.service';

describe('ExhaustGasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExhaustGasService]
    });
  });

  it('should be created', inject([ExhaustGasService], (service: ExhaustGasService) => {
    expect(service).toBeTruthy();
  }));
});
