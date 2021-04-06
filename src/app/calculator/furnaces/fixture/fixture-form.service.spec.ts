import { TestBed } from '@angular/core/testing';

import { FixtureFormService } from './fixture-form.service';

describe('FixtureFormService', () => {
  let service: FixtureFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FixtureFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
