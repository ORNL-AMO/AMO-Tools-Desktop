import { TestBed } from '@angular/core/testing';

import { WasteWaterAnalysisService } from './waste-water-analysis.service';

describe('WasteWaterAnalysisService', () => {
  let service: WasteWaterAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WasteWaterAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
