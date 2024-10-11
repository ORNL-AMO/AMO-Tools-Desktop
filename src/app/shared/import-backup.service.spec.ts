import { TestBed } from '@angular/core/testing';

import { ImportBackupService } from './import-backup.service';

describe('ImportBackupService', () => {
  let service: ImportBackupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportBackupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
