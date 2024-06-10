import { TestBed } from '@angular/core/testing';

import { WaterProcessIdbService } from './water-process-idb.service';

describe('WaterProcessIdbService', () => {
  let service: WaterProcessIdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterProcessIdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
