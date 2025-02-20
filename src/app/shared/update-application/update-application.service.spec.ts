import { TestBed } from '@angular/core/testing';

import { UpdateApplicationService } from './update-application.service';

describe('UpdateApplicationService', () => {
  let service: UpdateApplicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
