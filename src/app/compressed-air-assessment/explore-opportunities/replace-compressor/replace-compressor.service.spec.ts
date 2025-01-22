import { TestBed } from '@angular/core/testing';

import { ReplaceCompressorService } from './replace-compressor.service';

describe('ReplaceCompressorService', () => {
  let service: ReplaceCompressorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplaceCompressorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
