import { TestBed, inject } from '@angular/core/testing';

import { AtmosphereLossesService } from './atmosphere-losses.service';

describe('AtmosphereLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AtmosphereLossesService]
    });
  });

  it('should ...', inject([AtmosphereLossesService], (service: AtmosphereLossesService) => {
    expect(service).toBeTruthy();
  }));
});
