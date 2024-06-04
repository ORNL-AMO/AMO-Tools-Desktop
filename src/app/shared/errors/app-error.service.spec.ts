import { TestBed } from '@angular/core/testing';

import { AppErrorService } from './app-error.service';

describe('AppErrorService', () => {
  let service: AppErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
