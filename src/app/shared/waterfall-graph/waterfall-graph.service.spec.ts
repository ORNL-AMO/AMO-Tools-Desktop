import { TestBed, inject } from '@angular/core/testing';

import { WaterfallGraphService } from './waterfall-graph.service';

describe('WaterfallGraphService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WaterfallGraphService]
    });
  });

  it('should be created', inject([WaterfallGraphService], (service: WaterfallGraphService) => {
    expect(service).toBeTruthy();
  }));
});
