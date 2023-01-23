import { TestBed } from '@angular/core/testing';

import { ReplaceCompressorsService } from './replace-compressors.service';

describe('ReplaceCompressorsService', () => {
  let service: ReplaceCompressorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReplaceCompressorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
