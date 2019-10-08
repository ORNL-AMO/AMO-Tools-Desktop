import { TestBed } from '@angular/core/testing';

import { PipeSizingService } from './pipe-sizing.service';

describe('PipeSizingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PipeSizingService = TestBed.get(PipeSizingService);
    expect(service).toBeTruthy();
  });
});
