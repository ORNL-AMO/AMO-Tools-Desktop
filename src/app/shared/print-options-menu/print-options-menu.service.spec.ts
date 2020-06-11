import { TestBed } from '@angular/core/testing';

import { PrintOptionsMenuService } from './print-options-menu.service';

describe('PrintOptionsMenuService', () => {
  let service: PrintOptionsMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintOptionsMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
