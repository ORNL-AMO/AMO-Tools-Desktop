import { TestBed } from '@angular/core/testing';

import { LogToolDataService } from './log-tool-data.service';

describe('LogToolDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LogToolDataService = TestBed.get(LogToolDataService);
    expect(service).toBeTruthy();
  });
});
