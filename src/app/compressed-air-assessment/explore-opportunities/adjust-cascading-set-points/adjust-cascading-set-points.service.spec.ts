import { TestBed } from '@angular/core/testing';

import { AdjustCascadingSetPointsService } from './adjust-cascading-set-points.service';

describe('AdjustCascadingSetPointsService', () => {
  let service: AdjustCascadingSetPointsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdjustCascadingSetPointsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
