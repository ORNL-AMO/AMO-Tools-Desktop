import { TestBed, inject } from '@angular/core/testing';

import { FsatWarningService } from './fsat-warning.service';

describe('FsatWarningService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FsatWarningService]
    });
  });

  it('should be created', inject([FsatWarningService], (service: FsatWarningService) => {
    expect(service).toBeTruthy();
  }));
});
