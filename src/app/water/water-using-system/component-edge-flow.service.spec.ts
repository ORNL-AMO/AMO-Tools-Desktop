import { TestBed } from '@angular/core/testing';

import { ComponentEdgeFlowService } from './component-edge-flow.service';

describe('ComponentEdgeFlowService', () => {
  let service: ComponentEdgeFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComponentEdgeFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
