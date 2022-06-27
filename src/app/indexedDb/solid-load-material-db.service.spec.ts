import { TestBed } from '@angular/core/testing';

import { SolidLoadMaterialDbService } from './solid-load-material-db.service';

describe('SolidLoadMaterialDbService', () => {
  let service: SolidLoadMaterialDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolidLoadMaterialDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
