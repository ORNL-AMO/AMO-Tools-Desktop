import { TestBed, inject } from '@angular/core/testing';

import { PhastService } from './phast.service';

describe('PhastService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhastService]
    });
  });

  it('should ...', inject([PhastService], (service: PhastService) => {
    expect(service).toBeTruthy();
  }));
});
