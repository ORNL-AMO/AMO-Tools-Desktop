import { TestBed } from '@angular/core/testing';

import { WaterDiagramConnectionsService } from './water-diagram-connections.service';

describe('WaterDiagramConnectionsService', () => {
  let service: WaterDiagramConnectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterDiagramConnectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
