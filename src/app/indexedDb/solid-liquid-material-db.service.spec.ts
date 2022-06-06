import { TestBed } from '@angular/core/testing';

import { SolidLiquidMaterialDbService } from './solid-liquid-material-db.service';

describe('SolidLiquidMaterialDbService', () => {
  let service: SolidLiquidMaterialDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolidLiquidMaterialDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
