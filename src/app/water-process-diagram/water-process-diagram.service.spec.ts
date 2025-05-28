import { TestBed } from '@angular/core/testing';

import { WaterProcessDiagramService } from './water-process-diagram.service';

describe('WaterProcessDiagramService', () => {
  let service: WaterProcessDiagramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaterProcessDiagramService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
