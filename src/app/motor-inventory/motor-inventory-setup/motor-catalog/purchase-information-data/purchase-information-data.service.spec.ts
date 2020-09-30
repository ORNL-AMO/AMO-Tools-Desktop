import { TestBed } from '@angular/core/testing';

import { PurchaseInformationDataService } from './purchase-information-data.service';

describe('PurchaseInformationDataService', () => {
  let service: PurchaseInformationDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseInformationDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
