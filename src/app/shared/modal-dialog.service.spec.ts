import { TestBed } from '@angular/core/testing';

import { ModalDialogService } from './modal-dialog.service';

describe('ModalDialogService', () => {
  let service: ModalDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
