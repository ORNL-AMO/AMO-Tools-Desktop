import { TestBed, inject } from '@angular/core/testing';

import { Fsat203Service } from './fsat-203.service';

describe('Fsat203Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Fsat203Service]
    });
  });

  it('should be created', inject([Fsat203Service], (service: Fsat203Service) => {
    expect(service).toBeTruthy();
  }));
});
