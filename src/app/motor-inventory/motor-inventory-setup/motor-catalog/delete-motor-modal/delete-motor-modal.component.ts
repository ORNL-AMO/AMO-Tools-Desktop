import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
    selector: 'app-delete-motor-modal',
    templateUrl: './delete-motor-modal.component.html',
    styleUrls: ['./delete-motor-modal.component.css'],
    standalone: false
})
export class DeleteMotorModalComponent implements OnInit {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  @Output('emitDelete')
  emitDelete = new EventEmitter<boolean>();

  @ViewChild('deleteMotorModal', { static: false }) public deleteMotorModal: ModalDirective;


  constructor(private motorInventoryService: MotorInventoryService ) { }

  ngOnInit() {
    this.motorInventoryService.modalOpen.next(true);
  }

  ngAfterViewInit() {
    this.deleteMotorModal.show();
  }

  close() {
    this.deleteMotorModal.hide();
    this.motorInventoryService.modalOpen.next(false);
    this.deleteMotorModal.onHidden.subscribe(() => {
      this.emitClose.emit(true);
    });
  }

  deleteMotor() {
    this.deleteMotorModal.hide();
    this.motorInventoryService.modalOpen.next(false);
    this.deleteMotorModal.onHidden.subscribe(() => {
      this.emitDelete.emit(true);
    });
  }
}
