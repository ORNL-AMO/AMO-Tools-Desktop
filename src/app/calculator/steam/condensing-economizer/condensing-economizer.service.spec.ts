import { TestBed } from '@angular/core/testing';

import { CondensingEconomizerService } from './condensing-economizer.service';

describe('CondensingEconomizerService', () => {
  let service: CondensingEconomizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CondensingEconomizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
