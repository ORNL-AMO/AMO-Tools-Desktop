import { TestBed, inject } from '@angular/core/testing';

import { StandaloneService } from './standalone.service';

describe('StandaloneService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StandaloneService]
    });
  });

  it('should be created', inject([StandaloneService], (service: StandaloneService) => {
    expect(service).toBeTruthy();
  }));
});
