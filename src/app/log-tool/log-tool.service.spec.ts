import { TestBed } from '@angular/core/testing';

import { LogToolService } from './log-tool.service';

describe('LogToolService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LogToolService = TestBed.get(LogToolService);
    expect(service).toBeTruthy();
  });
});
