import { TestBed, inject } from '@angular/core/testing';

import { LossesService } from './losses.service';

describe('LossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LossesService]
    });
  });

  it('should be created', inject([LossesService], (service: LossesService) => {
    expect(service).toBeTruthy();
  }));
});
