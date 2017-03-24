import { TestBed, inject } from '@angular/core/testing';

import { FlueGasLossesService } from './flue-gas-losses.service';

describe('FlueGasLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlueGasLossesService]
    });
  });

  it('should ...', inject([FlueGasLossesService], (service: FlueGasLossesService) => {
    expect(service).toBeTruthy();
  }));
});
