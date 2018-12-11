import { TestBed, inject } from '@angular/core/testing';

import { FieldDataService } from './field-data.service';

describe('FieldDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FieldDataService]
    });
  });

  it('should be created', inject([FieldDataService], (service: FieldDataService) => {
    expect(service).toBeTruthy();
  }));
});
