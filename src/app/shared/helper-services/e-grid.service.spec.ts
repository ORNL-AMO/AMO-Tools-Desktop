import { TestBed } from '@angular/core/testing';

import { EGridService } from './e-grid.service';

describe('EGridService', () => {
  let service: EGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
