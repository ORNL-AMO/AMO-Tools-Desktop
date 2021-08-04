import { TestBed } from '@angular/core/testing';

import { WaterHeatingFormService } from './water-heating-form.service';

describe('WaterHeatingFormService', () => {
  let service: WaterHeatingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterHeatingFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
