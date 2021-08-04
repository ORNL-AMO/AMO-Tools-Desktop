import { TestBed } from '@angular/core/testing';

import { AtmosphereService } from './atmosphere.service';

describe('AtmosphereService', () => {
  let service: AtmosphereService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtmosphereService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
