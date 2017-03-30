import { TestBed, inject } from '@angular/core/testing';

import { ConvertUnitsService } from './convert-units.service';

describe('ConvertUnitsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConvertUnitsService]
    });
  });

  it('should ...', inject([ConvertUnitsService], (service: ConvertUnitsService) => {
    expect(service).toBeTruthy();
  }));
});
