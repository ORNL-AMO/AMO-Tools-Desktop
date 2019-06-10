import { TestBed, inject } from '@angular/core/testing';

import { ConvertFsatService } from './convert-fsat.service';

describe('ConvertFsatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConvertFsatService]
    });
  });

  it('should be created', inject([ConvertFsatService], (service: ConvertFsatService) => {
    expect(service).toBeTruthy();
  }));
});
