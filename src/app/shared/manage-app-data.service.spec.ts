import { TestBed } from '@angular/core/testing';

import { ManageAppDataService } from './manage-app-data.service';

describe('ManageAppDataService', () => {
  let service: ManageAppDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageAppDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
