import { TestBed, inject } from '@angular/core/testing';

import { FsatFluidService } from './fsat-fluid.service';

describe('FsatFluidService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FsatFluidService]
    });
  });

  it('should be created', inject([FsatFluidService], (service: FsatFluidService) => {
    expect(service).toBeTruthy();
  }));
});
