import { TestBed } from '@angular/core/testing';

import { WallService } from './wall.service';

describe('WallService', () => {
  let service: WallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
