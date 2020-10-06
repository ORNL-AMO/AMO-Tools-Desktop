import { TestBed } from '@angular/core/testing';

import { EfficiencyImprovementGraphService } from './efficiency-improvement-graph.service';

describe('EfficiencyImprovementGraphService', () => {
  let service: EfficiencyImprovementGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EfficiencyImprovementGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
