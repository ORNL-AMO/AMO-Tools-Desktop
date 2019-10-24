import { TestBed } from '@angular/core/testing';

import { ConvertInputDataService } from './convert-input-data.service';

describe('ConvertInputDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ConvertInputDataService = TestBed.get(ConvertInputDataService);
    expect(service).toBeTruthy();
  });
});
