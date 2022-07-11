import { TestBed } from '@angular/core/testing';

import { LiquidLoadMaterialDbService } from './liquid-load-material-db.service';

describe('LiquidLoadMaterialDbService', () => {
  let service: LiquidLoadMaterialDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiquidLoadMaterialDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
