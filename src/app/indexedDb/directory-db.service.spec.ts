import { TestBed, inject } from '@angular/core/testing';

import { DirectoryDbService } from './directory-db.service';

describe('DirectoryDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirectoryDbService]
    });
  });

  it('should be created', inject([DirectoryDbService], (service: DirectoryDbService) => {
    expect(service).toBeTruthy();
  }));
});
