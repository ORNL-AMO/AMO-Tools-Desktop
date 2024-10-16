import { TestBed } from '@angular/core/testing';

import { AutomaticBackupService } from './automatic-backup.service';

describe('AutomaticBackupService', () => {
  let service: AutomaticBackupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomaticBackupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
