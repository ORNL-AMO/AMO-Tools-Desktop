import { TestBed, inject } from '@angular/core/testing';

import { UnitConverterService } from './unit-converter.service';

describe('UnitConverterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnitConverterService]
    });
  });

  it('should be created', inject([UnitConverterService], (service: UnitConverterService) => {
    expect(service).toBeTruthy();
  }));
});
