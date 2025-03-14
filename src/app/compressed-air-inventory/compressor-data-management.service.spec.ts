import { TestBed } from '@angular/core/testing';

import { CompressorDataManagementService } from './compressor-data-management.service';

describe('CompressorDataManagementService', () => {
  let service: CompressorDataManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompressorDataManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
