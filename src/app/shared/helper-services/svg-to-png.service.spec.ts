import { TestBed, inject } from '@angular/core/testing';

import { SvgToPngService } from './svg-to-png.service';

describe('SvgToPngService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SvgToPngService]
    });
  });

  it('should be created', inject([SvgToPngService], (service: SvgToPngService) => {
    expect(service).toBeTruthy();
  }));
});
