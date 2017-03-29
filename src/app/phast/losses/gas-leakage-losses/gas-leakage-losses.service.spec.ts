import { TestBed, inject } from '@angular/core/testing';

import { GasLeakageLossesService } from './gas-leakage-losses.service';

describe('GasLeakageLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GasLeakageLossesService]
    });
  });

  it('should ...', inject([GasLeakageLossesService], (service: GasLeakageLossesService) => {
    expect(service).toBeTruthy();
  }));
});
