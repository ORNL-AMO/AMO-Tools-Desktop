import { TestBed, inject } from '@angular/core/testing';

import { SlagService } from './slag.service';

describe('SlagService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SlagService]
    });
  });

  it('should be created', inject([SlagService], (service: SlagService) => {
    expect(service).toBeTruthy();
  }));
});
