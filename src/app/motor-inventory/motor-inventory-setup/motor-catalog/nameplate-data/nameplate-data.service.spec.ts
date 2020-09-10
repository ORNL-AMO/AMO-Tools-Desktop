import { TestBed } from '@angular/core/testing';

import { NameplateDataService } from './nameplate-data.service';

describe('NameplateDataService', () => {
  let service: NameplateDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NameplateDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
