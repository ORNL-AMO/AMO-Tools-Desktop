import { TestBed } from '@angular/core/testing';

import { HeatCascadingFormService } from './heat-cascading-form.service';

describe('HeatCascadingFormService', () => {
  let service: HeatCascadingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeatCascadingFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
