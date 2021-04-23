import { TestBed } from '@angular/core/testing';

import { SystemBasicsFormService } from './system-basics-form.service';

describe('SystemBasicsFormService', () => {
  let service: SystemBasicsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemBasicsFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
