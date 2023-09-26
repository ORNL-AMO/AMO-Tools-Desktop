import { TestBed } from '@angular/core/testing';

import { ProcessHeatingApiService } from './process-heating-api.service';

describe('ProcessHeatingApiService', () => {
  let service: ProcessHeatingApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessHeatingApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
