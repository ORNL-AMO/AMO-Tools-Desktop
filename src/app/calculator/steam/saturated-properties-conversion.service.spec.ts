import { TestBed } from '@angular/core/testing';

import { SaturatedPropertiesConversionService } from './saturated-properties-conversion.service';

describe('SaturatedPropertiesConversionService', () => {
  let service: SaturatedPropertiesConversionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaturatedPropertiesConversionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
