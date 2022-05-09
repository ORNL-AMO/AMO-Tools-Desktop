import { TestBed } from '@angular/core/testing';

import { TreasureHuntPptService } from './treasure-hunt-ppt.service';

describe('TreasureHuntPptService', () => {
  let service: TreasureHuntPptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreasureHuntPptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
