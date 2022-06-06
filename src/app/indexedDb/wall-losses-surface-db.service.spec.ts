import { TestBed } from '@angular/core/testing';

import { WallLossesSurfaceDbService } from './wall-losses-surface-db.service';

describe('WallLossesSurfaceDbService', () => {
  let service: WallLossesSurfaceDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WallLossesSurfaceDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
