import { TestBed } from '@angular/core/testing';

import { FixtureService } from './fixture.service';

describe('FixtureService', () => {
  let service: FixtureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FixtureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
