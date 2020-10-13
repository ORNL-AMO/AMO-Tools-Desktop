import { TestBed } from '@angular/core/testing';

import { VisualizeMenuService } from './visualize-menu.service';

describe('VisualizeMenuService', () => {
  let service: VisualizeMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualizeMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
