import { TestBed, inject } from '@angular/core/testing';

import { DeaeratorService } from './deaerator.service';

describe('DeaeratorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeaeratorService]
    });
  });

  it('should be created', inject([DeaeratorService], (service: DeaeratorService) => {
    expect(service).toBeTruthy();
  }));
});
