import { TestBed, inject } from '@angular/core/testing';

import { HeatStorageService } from './heat-storage.service';

describe('HeatStorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HeatStorageService]
    });
  });

  it('should ...', inject([HeatStorageService], (service: HeatStorageService) => {
    expect(service).toBeTruthy();
  }));
});
