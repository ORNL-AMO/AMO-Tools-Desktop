import { TestBed } from '@angular/core/testing';

import { GenericCompressorDbService } from './generic-compressor-db.service';

describe('GenericCompressorDbService', () => {
  let service: GenericCompressorDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericCompressorDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
