import { TestBed } from '@angular/core/testing';

import { MaxFullFlowCalculationsService } from './max-full-flow-calculations.service';

describe('MaxFullFlowCalculationsService', () => {
  let service: MaxFullFlowCalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaxFullFlowCalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
