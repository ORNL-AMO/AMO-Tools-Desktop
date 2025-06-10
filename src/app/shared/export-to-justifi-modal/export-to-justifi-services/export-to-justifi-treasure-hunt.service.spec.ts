import { TestBed } from '@angular/core/testing';

import { ExportToJustifiTreasureHuntService } from './export-to-justifi-treasure-hunt.service';

describe('ExportToJustifiTreasureHuntService', () => {
  let service: ExportToJustifiTreasureHuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportToJustifiTreasureHuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
