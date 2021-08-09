import { TestBed } from '@angular/core/testing';

import { AltitudeCorrectionService } from './altitude-correction.service';

describe('AltitudeCorrectionService', () => {
  let service: AltitudeCorrectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AltitudeCorrectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
