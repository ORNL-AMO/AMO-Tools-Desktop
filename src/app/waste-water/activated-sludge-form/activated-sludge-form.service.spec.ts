import { TestBed } from '@angular/core/testing';

import { ActivatedSludgeFormService } from './activated-sludge-form.service';

describe('ActivatedSludgeFormService', () => {
  let service: ActivatedSludgeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivatedSludgeFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
