import { TestBed } from '@angular/core/testing';

import { BackupDataService } from './backup-data.service';

describe('BackupDataService', () => {
  let service: BackupDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackupDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
