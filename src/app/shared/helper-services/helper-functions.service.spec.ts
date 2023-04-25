import { TestBed } from '@angular/core/testing';

import { HelperFunctionsService } from './helper-functions.service';

describe('HelperFunctionsService', () => {
  let service: HelperFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelperFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
