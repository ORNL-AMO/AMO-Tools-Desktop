import { TestBed } from '@angular/core/testing';

import { CsvToJsonService } from './csv-to-json.service';

describe('CsvToJsonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CsvToJsonService = TestBed.get(CsvToJsonService);
    expect(service).toBeTruthy();
  });
});
