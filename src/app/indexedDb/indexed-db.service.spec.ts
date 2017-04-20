import { TestBed, inject } from '@angular/core/testing';

import { IndexedDbService } from './indexed-db.service';

describe('IndexedDbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IndexedDbService]
    });
  });

  it('should ...', inject([IndexedDbService], (service: IndexedDbService) => {
    expect(service).toBeTruthy();
  }));
});
