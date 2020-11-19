import { TestBed } from '@angular/core/testing';

import { FlueGasService } from './flue-gas.service';

describe('FlueGasService', () => {
  let service: FlueGasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlueGasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
