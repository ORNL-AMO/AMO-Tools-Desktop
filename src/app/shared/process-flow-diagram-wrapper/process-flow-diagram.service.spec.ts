import { TestBed } from '@angular/core/testing';

import { ProcessFlowDiagramService } from './process-flow-diagram.service';

describe('ProcessFlowDiagramService', () => {
  let service: ProcessFlowDiagramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessFlowDiagramService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
