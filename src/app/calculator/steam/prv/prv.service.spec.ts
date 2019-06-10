import { TestBed, inject } from '@angular/core/testing';

import { PrvService } from './prv.service';

describe('PrvService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrvService]
    });
  });

  it('should be created', inject([PrvService], (service: PrvService) => {
    expect(service).toBeTruthy();
  }));
});
