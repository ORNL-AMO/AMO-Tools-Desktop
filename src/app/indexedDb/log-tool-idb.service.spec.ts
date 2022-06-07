import { TestBed } from '@angular/core/testing';

import { LogToolIdbService } from './log-tool-idb.service';

describe('LogToolIdbService', () => {
  let service: LogToolIdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogToolIdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
