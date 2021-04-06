import { TestBed } from '@angular/core/testing';

import { CoolingFormService } from './cooling-form.service';

describe('CoolingFormService', () => {
  let service: CoolingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolingFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
