import { TestBed, inject } from '@angular/core/testing';

import { PsatWarningService } from './psat-warning.service';

describe('PsatWarningService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PsatWarningService]
    });
  });

  it('should be created', inject([PsatWarningService], (service: PsatWarningService) => {
    expect(service).toBeTruthy();
  }));
});
