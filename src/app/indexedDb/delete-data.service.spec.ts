import { TestBed, inject } from '@angular/core/testing';

import { DeleteDataService } from './delete-data.service';

describe('DeletedDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeleteDataService]
    });
  });

  it('should be created', inject([DeleteDataService], (service: DeleteDataService) => {
    expect(service).toBeTruthy();
  }));
});
