import { TestBed, inject } from '@angular/core/testing';

import { LightingReplacementService } from './lighting-replacement.service';

describe('LightingReplacementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LightingReplacementService]
    });
  });

  it('should be created', inject([LightingReplacementService], (service: LightingReplacementService) => {
    expect(service).toBeTruthy();
  }));
});
