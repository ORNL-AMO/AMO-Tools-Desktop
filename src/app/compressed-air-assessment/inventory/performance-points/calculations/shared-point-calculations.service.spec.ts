import { TestBed } from '@angular/core/testing';

import { SharedPointCalculationsService } from './shared-point-calculations.service';

describe('SharedPointCalculationsService', () => {
  let service: SharedPointCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedPointCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
