import { TestBed } from '@angular/core/testing';

import { ProcessCoolingUiService } from './process-cooling-ui.service';

describe('ProcessCoolingUiService', () => {
  let service: ProcessCoolingUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessCoolingUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
