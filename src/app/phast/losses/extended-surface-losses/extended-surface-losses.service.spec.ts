import { TestBed, inject } from '@angular/core/testing';

import { ExtendedSurfaceLossesService } from './extended-surface-losses.service';

describe('ExtendedSurfaceLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExtendedSurfaceLossesService]
    });
  });

  it('should ...', inject([ExtendedSurfaceLossesService], (service: ExtendedSurfaceLossesService) => {
    expect(service).toBeTruthy();
  }));
});
