import { TestBed } from '@angular/core/testing';

import { LogToolDbService } from './log-tool-db.service';

describe('LogToolDbService', () => {
  let service: LogToolDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogToolDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
