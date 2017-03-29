import { TestBed, inject } from '@angular/core/testing';

import { CoolingLossesService } from './cooling-losses.service';

describe('CoolingLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoolingLossesService]
    });
  });

  it('should ...', inject([CoolingLossesService], (service: CoolingLossesService) => {
    expect(service).toBeTruthy();
  }));
});
