import { TestBed, inject } from '@angular/core/testing';

import { SpecificSpeedService } from './specific-speed.service';

describe('SpecificSpeedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpecificSpeedService]
    });
  });

  it('should be created', inject([SpecificSpeedService], (service: SpecificSpeedService) => {
    expect(service).toBeTruthy();
  }));
});
