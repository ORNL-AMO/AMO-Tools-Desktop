import { TestBed } from '@angular/core/testing';

import { LiquidMaterialFormService } from './liquid-material-form.service';

describe('LiquidMaterialFormService', () => {
  let service: LiquidMaterialFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiquidMaterialFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
