import { TestBed } from '@angular/core/testing';

import { WallFormService } from './wall-form.service';

describe('WallFormService', () => {
  let service: WallFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WallFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
