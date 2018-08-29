import { TestBed, inject } from '@angular/core/testing';

import { PsatTabService } from './psat-tab.service';

describe('PsatTabService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PsatTabService]
    });
  });

  it('should be created', inject([PsatTabService], (service: PsatTabService) => {
    expect(service).toBeTruthy();
  }));
});
