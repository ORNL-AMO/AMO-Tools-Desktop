import { TestBed, inject } from '@angular/core/testing';

import { ReplaceRewindService } from './replace-rewind.service';

describe('ReplaceRewindService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReplaceRewindService]
    });
  });

  it('should be created', inject([ReplaceRewindService], (service: ReplaceRewindService) => {
    expect(service).toBeTruthy();
  }));
});
