import { TestBed, inject } from '@angular/core/testing';

import { FlashTankService } from './flash-tank.service';

describe('FlashTankService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlashTankService]
    });
  });

  it('should be created', inject([FlashTankService], (service: FlashTankService) => {
    expect(service).toBeTruthy();
  }));
});
