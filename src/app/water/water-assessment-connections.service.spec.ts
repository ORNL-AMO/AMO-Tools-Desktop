import { TestBed } from '@angular/core/testing';

import { WaterAssessmentConnectionsService } from './water-assessment-connections.service';

describe('WaterAssessmentConnectionsService', () => {
  let service: WaterAssessmentConnectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterAssessmentConnectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
