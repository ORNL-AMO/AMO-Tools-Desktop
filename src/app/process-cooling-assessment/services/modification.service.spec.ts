import { TestBed } from '@angular/core/testing';

import { ModificationService } from './modification.service';

describe('ModificationService', () => {
  let service: ModificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
