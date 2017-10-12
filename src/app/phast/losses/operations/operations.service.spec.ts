import { TestBed, inject } from '@angular/core/testing';

import { OperationsService } from './operations.service';

describe('OperationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OperationsService]
    });
  });

  it('should be created', inject([OperationsService], (service: OperationsService) => {
    expect(service).toBeTruthy();
  }));
});
