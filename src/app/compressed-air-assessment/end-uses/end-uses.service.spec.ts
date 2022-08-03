import { TestBed } from '@angular/core/testing';

import { EndUsesService } from './end-uses.service';

describe('EndUsesService', () => {
  let service: EndUsesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EndUsesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
