import { TestBed, inject } from '@angular/core/testing';

import { ChargeMaterialService } from './charge-material.service';

describe('ChargeMaterialService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChargeMaterialService]
    });
  });

  it('should ...', inject([ChargeMaterialService], (service: ChargeMaterialService) => {
    expect(service).toBeTruthy();
  }));
});
