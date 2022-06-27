import { TestBed } from '@angular/core/testing';

import { GasLoadMaterialDbService } from './gas-load-material-db.service';

describe('GasLoadMaterialDbService', () => {
  let service: GasLoadMaterialDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GasLoadMaterialDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
