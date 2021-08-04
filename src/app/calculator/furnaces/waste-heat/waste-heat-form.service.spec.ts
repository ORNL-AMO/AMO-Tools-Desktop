import { TestBed } from '@angular/core/testing';

import { WasteHeatFormService } from './waste-heat-form.service';

describe('WasteHeatFormService', () => {
  let service: WasteHeatFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasteHeatFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
