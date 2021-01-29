import { TestBed } from '@angular/core/testing';

import { OtherDataService } from './other-data.service';

describe('OtherDataService', () => {
  let service: OtherDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtherDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
