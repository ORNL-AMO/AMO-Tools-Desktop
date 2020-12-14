import { TestBed } from '@angular/core/testing';

import { GasMaterialFormService } from './gas-material-form.service';

describe('GasMaterialFormService', () => {
  let service: GasMaterialFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GasMaterialFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
