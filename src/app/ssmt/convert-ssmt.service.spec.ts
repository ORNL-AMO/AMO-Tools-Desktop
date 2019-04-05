import { TestBed, inject } from '@angular/core/testing';

import { ConvertSsmtService } from './convert-ssmt.service';

describe('ConvertSsmtService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConvertSsmtService]
    });
  });

  it('should be created', inject([ConvertSsmtService], (service: ConvertSsmtService) => {
    expect(service).toBeTruthy();
  }));
});
