import { TestBed, inject } from '@angular/core/testing';

import { FixtureLossesService } from './fixture-losses.service';

describe('FixtureLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FixtureLossesService]
    });
  });

  it('should ...', inject([FixtureLossesService], (service: FixtureLossesService) => {
    expect(service).toBeTruthy();
  }));
});
