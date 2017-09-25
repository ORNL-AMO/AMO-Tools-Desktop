import { TestBed, inject } from '@angular/core/testing';

import { SankeyService } from './sankey.service';

describe('SankeyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SankeyService]
    });
  });

  it('should be created', inject([SankeyService], (service: SankeyService) => {
    expect(service).toBeTruthy();
  }));
});


