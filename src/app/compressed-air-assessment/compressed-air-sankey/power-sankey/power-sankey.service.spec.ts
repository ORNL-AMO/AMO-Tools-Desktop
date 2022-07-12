import { TestBed } from '@angular/core/testing';

import { PowerSankeyService } from './power-sankey.service';

describe('PowerSankeyService', () => {
  let service: PowerSankeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PowerSankeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
