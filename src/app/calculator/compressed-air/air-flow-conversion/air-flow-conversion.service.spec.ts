import { TestBed } from '@angular/core/testing';

import { AirFlowConversionService } from './air-flow-conversion.service';

describe('AirFlowConversionService', () => {
  let service: AirFlowConversionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirFlowConversionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
