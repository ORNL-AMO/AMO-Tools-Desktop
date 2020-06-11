import { TestBed } from '@angular/core/testing';

import { VisualizeService } from './visualize.service';

describe('VisualizeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VisualizeService = TestBed.get(VisualizeService);
    expect(service).toBeTruthy();
  });
});
