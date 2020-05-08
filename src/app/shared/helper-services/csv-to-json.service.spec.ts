import { TestBed } from '@angular/core/testing';

import { CsvToJsonService } from './csv-to-json.service';

describe('CsvToJsonService', () => {
  let service: CsvToJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvToJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
