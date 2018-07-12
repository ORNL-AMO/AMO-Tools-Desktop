import { TestBed, inject } from '@angular/core/testing';

import { FsatService } from './fsat.service';

describe('FsatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FsatService]
    });
  });

  it('should be created', inject([FsatService], (service: FsatService) => {
    expect(service).toBeTruthy();
  }));
});
