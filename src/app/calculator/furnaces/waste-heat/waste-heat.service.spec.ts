import { TestBed } from '@angular/core/testing';

import { WasteHeatService } from './waste-heat.service';

describe('WasteHeatService', () => {
  let service: WasteHeatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasteHeatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
