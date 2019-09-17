import { TestBed, inject } from '@angular/core/testing';

import { JsonToCsvService } from './json-to-csv.service';

describe('JsonToCsvService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonToCsvService]
    });
  });

  it('should be created', inject([JsonToCsvService], (service: JsonToCsvService) => {
    expect(service).toBeTruthy();
  }));
});
