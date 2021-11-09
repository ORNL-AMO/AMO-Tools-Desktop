import { TestBed } from '@angular/core/testing';

import { CondensingEconomizerFormService } from './condensing-economizer-form.service';

describe('CondensingEconomizerFormService', () => {
  let service: CondensingEconomizerFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CondensingEconomizerFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
