import { TestBed } from '@angular/core/testing';

import { DirectoryDashboardService } from './directory-dashboard.service';

describe('DirectoryDashboardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DirectoryDashboardService = TestBed.get(DirectoryDashboardService);
    expect(service).toBeTruthy();
  });
});
