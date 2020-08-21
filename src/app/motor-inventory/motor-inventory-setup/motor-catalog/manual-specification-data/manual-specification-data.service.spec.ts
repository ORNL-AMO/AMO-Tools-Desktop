import { TestBed } from '@angular/core/testing';

import { ManualSpecificationDataService } from './manual-specification-data.service';

describe('ManualSpecificationDataService', () => {
  let service: ManualSpecificationDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualSpecificationDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
