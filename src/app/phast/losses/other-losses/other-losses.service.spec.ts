import { TestBed, inject } from '@angular/core/testing';

import { OtherLossesService } from './other-losses.service';

describe('OtherLossesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OtherLossesService]
    });
  });

  it('should ...', inject([OtherLossesService], (service: OtherLossesService) => {
    expect(service).toBeTruthy();
  }));
});
