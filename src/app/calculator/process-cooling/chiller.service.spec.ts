import { TestBed } from '@angular/core/testing';

import { ChillerService } from './chiller.service';

describe('ChillerService', () => {
  let service: ChillerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChillerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
