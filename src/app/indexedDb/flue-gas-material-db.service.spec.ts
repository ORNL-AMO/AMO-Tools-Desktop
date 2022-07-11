import { TestBed } from '@angular/core/testing';

import { FlueGasMaterialDbService } from './flue-gas-material-db.service';

describe('FlueGasMaterialDbService', () => {
  let service: FlueGasMaterialDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlueGasMaterialDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
