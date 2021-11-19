import { TestBed } from '@angular/core/testing';

import { UnloadPointCalculationsService } from './unload-point-calculations.service';

describe('UnloadPointCalculationsService', () => {
  let service: UnloadPointCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnloadPointCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
