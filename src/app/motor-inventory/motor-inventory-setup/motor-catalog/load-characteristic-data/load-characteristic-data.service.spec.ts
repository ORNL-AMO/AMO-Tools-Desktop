import { TestBed } from '@angular/core/testing';

import { LoadCharacteristicDataService } from './load-characteristic-data.service';

describe('LoadCharacteristicDataService', () => {
  let service: LoadCharacteristicDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadCharacteristicDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
