import { TestBed, inject } from '@angular/core/testing';

import { BalanceTurbinesService } from './balance-turbines.service';

describe('BalanceTurbinesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BalanceTurbinesService]
    });
  });

  it('should be created', inject([BalanceTurbinesService], (service: BalanceTurbinesService) => {
    expect(service).toBeTruthy();
  }));
});
