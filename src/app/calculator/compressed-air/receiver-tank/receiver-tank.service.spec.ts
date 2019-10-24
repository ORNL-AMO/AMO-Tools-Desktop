import { TestBed } from '@angular/core/testing';

import { ReceiverTankService } from './receiver-tank.service';

describe('ReceiverTankService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReceiverTankService = TestBed.get(ReceiverTankService);
    expect(service).toBeTruthy();
  });
});
