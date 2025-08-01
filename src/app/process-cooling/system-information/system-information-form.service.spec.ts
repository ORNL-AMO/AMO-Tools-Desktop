import { TestBed } from '@angular/core/testing';

import { SystemInformationFormService } from './system-information-form.service';

describe('SystemInformationFormService', () => {
  let service: SystemInformationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemInformationFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
