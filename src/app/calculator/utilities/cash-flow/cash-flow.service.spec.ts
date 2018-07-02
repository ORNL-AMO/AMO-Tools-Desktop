import { TestBed, inject } from '@angular/core/testing';

import { CashFlowService } from './cash-flow.service';

describe('CashFlowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CashFlowService]
    });
  });

  it('should be created', inject([CashFlowService], (service: CashFlowService) => {
    expect(service).toBeTruthy();
  }));
});
