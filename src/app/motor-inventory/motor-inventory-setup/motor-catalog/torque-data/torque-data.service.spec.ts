import { TestBed } from '@angular/core/testing';

import { TorqueDataService } from './torque-data.service';

describe('TorqueDataService', () => {
  let service: TorqueDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TorqueDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
