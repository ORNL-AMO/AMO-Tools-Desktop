import { TestBed, inject } from '@angular/core/testing';

import { ReplaceExistingService } from './replace-existing.service';

describe('ReplaceExistingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReplaceExistingService]
    });
  });

  it('should be created', inject([ReplaceExistingService], (service: ReplaceExistingService) => {
    expect(service).toBeTruthy();
  }));
});
