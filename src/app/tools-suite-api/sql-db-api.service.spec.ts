import { TestBed } from '@angular/core/testing';

import { SqlDbApiService } from './sql-db-api.service';

describe('SqlDbApiService', () => {
  let service: SqlDbApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SqlDbApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
