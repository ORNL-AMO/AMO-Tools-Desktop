import { TestBed } from '@angular/core/testing';

import { PlaneDataFormService } from './plane-data-form.service';

describe('PlaneDataFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlaneDataFormService = TestBed.get(PlaneDataFormService);
    expect(service).toBeTruthy();
  });
});
