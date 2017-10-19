import { TestBed, inject } from '@angular/core/testing';

import { ConvertPhastService } from './convert-phast.service';

describe('ConvertPhastService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConvertPhastService]
    });
  });

  it('should be created', inject([ConvertPhastService], (service: ConvertPhastService) => {
    expect(service).toBeTruthy();
  }));
});