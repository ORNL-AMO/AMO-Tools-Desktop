import { TestBed, inject } from '@angular/core/testing';

import { BoilerService } from './boiler.service';

describe('BoilerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoilerService]
    });
  });

  it('should be created', inject([BoilerService], (service: BoilerService) => {
    expect(service).toBeTruthy();
  }));
});
