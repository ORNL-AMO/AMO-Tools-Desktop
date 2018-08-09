import { TestBed, inject } from '@angular/core/testing';

import { StackLossService } from './stack-loss.service';

describe('StackLossService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StackLossService]
    });
  });

  it('should be created', inject([StackLossService], (service: StackLossService) => {
    expect(service).toBeTruthy();
  }));
});
