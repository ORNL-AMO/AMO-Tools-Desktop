import { TestBed } from '@angular/core/testing';

import { FlowReallocationService } from './flow-reallocation.service';

describe('FlowReallocationService', () => {
  let service: FlowReallocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlowReallocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
