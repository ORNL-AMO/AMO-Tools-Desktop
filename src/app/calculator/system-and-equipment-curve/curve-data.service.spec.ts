import { TestBed } from '@angular/core/testing';

import { CurveDataService } from './curve-data.service';

describe('CurveDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CurveDataService = TestBed.get(CurveDataService);
    expect(service).toBeTruthy();
  });
});
