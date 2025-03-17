import { TestBed } from '@angular/core/testing';

import { ExistingCompressorDbService } from './existing-compressor-db.service';

describe('ExistingCompressorDbService', () => {
  let service: ExistingCompressorDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExistingCompressorDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
