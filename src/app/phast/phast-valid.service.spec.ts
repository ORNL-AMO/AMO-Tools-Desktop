import { TestBed } from '@angular/core/testing';

import { PhastValidService } from './phast-valid.service';

describe('PhastValidService', () => {
  let service: PhastValidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhastValidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
