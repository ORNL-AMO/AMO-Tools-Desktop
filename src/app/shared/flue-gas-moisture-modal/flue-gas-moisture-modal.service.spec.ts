import { TestBed } from '@angular/core/testing';

import { FlueGasMoistureModalService } from './flue-gas-moisture-modal.service';

describe('FlueGasMoistureModalService', () => {
  let service: FlueGasMoistureModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlueGasMoistureModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
