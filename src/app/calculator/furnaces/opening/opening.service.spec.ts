import { TestBed } from '@angular/core/testing';

import { OpeningService } from './opening.service';

describe('OpeningService', () => {
  let service: OpeningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpeningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
