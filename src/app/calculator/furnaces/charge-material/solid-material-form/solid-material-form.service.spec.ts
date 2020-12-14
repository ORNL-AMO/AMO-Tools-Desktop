import { TestBed } from '@angular/core/testing';

import { SolidMaterialFormService } from './solid-material-form.service';

describe('SolidMaterialFormService', () => {
  let service: SolidMaterialFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolidMaterialFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
