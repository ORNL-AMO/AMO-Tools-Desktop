import { TestBed } from '@angular/core/testing';

import { ModelingOptionsFormService } from './modeling-options-form.service';

describe('ModelingOptionsFormService', () => {
  let service: ModelingOptionsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelingOptionsFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
