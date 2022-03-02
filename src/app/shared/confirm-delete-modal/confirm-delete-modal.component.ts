import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ConfirmDeleteData } from './confirmDeleteData';

@Component({
  selector: 'app-confirm-delete-modal',
  templateUrl: './confirm-delete-modal.component.html',
  styleUrls: ['./confirm-delete-modal.component.css']
})
export class ConfirmDeleteModalComponent implements OnInit {
  @Output('emitShouldDelete')
  shouldDelete = new EventEmitter<boolean>();
  @Input()
  confirmDeleteData: ConfirmDeleteData;
  @ViewChild('confirmDeleteModal', { static: false }) public confirmDeleteModal: ModalDirective;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.confirmDeleteModal.show();
  }

  close(shouldDelete: boolean) {
    this.confirmDeleteModal.hide();
    this.shouldDelete.emit(shouldDelete);
  }
}
