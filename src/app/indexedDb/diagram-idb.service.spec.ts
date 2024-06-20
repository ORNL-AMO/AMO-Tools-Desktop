import { TestBed } from '@angular/core/testing';

import { DiagramIdbService } from './diagram-idb.service';

describe('DiagramIdbService', () => {
  let service: DiagramIdbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiagramIdbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
