import { TestBed } from '@angular/core/testing';

import { AtmosphereDbService } from './atmosphere-db.service';

describe('AtmosphereDbService', () => {
  let service: AtmosphereDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtmosphereDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
