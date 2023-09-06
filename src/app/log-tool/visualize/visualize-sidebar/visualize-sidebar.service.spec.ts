import { TestBed } from '@angular/core/testing';

import { VisualizeSidebarService } from './visualize-sidebar.service';

describe('VisualizeSidebarService', () => {
  let service: VisualizeSidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualizeSidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
