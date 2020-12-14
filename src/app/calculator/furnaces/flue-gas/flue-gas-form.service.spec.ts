import { TestBed } from '@angular/core/testing';

import { FlueGasFormService } from './flue-gas-form.service';

describe('FlueGasFormService', () => {
  let service: FlueGasFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlueGasFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
