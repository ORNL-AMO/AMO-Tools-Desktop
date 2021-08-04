import { TestBed } from '@angular/core/testing';

import { AtmosphereFormService } from './atmosphere-form.service';

describe('AtmosphereFormService', () => {
  let service: AtmosphereFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtmosphereFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
