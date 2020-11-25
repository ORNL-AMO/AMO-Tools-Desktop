import { TestBed } from '@angular/core/testing';

import { ChargeMaterialFormService } from './charge-material-form.service';

describe('ChargeMaterialFormService', () => {
  let service: ChargeMaterialFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChargeMaterialFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
