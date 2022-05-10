import { TestBed } from '@angular/core/testing';

import { CentrifugalGraphService } from './centrifugal-graph.service';

describe('CentrifugalGraphService', () => {
  let service: CentrifugalGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentrifugalGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
