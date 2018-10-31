import { TestBed, inject } from '@angular/core/testing';

import { PumpFluidService } from './pump-fluid.service';

describe('PumpFluidService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PumpFluidService]
    });
  });

  it('should be created', inject([PumpFluidService], (service: PumpFluidService) => {
    expect(service).toBeTruthy();
  }));
});
