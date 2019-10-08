import { TestBed } from '@angular/core/testing';

import { BagMethodService } from './bag-method.service';

describe('BagMethodService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BagMethodService = TestBed.get(BagMethodService);
    expect(service).toBeTruthy();
  });
});
