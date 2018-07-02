import { TestBed, inject } from '@angular/core/testing';

import { SettingsDbService } from './settings-db.service';

describe('SettingsDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsDbService]
    });
  });

  it('should be created', inject([SettingsDbService], (service: SettingsDbService) => {
    expect(service).toBeTruthy();
  }));
});
