import { TestBed } from '@angular/core/testing';

import { ImportBackupModalService } from './import-backup-modal.service';

describe('ImportBackupModalService', () => {
  let service: ImportBackupModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportBackupModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
