import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { SuiteDbMotor } from '../../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MotorInventoryService } from '../../../motor-inventory.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-select-motor-modal',
  templateUrl: './select-motor-modal.component.html',
  styleUrls: ['./select-motor-modal.component.css']
})
export class SelectMotorModalComponent implements OnInit {
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  @Output('emitSelect')
  emitSelect = new EventEmitter<SuiteDbMotor>();

  @ViewChild('motorModal', { static: false }) public motorModal: ModalDirective;


  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit() {
    this.motorInventoryService.modalOpen.next(true);
  }

  ngAfterViewInit() {
    this.motorModal.show();
  }

  close() {
    this.motorModal.hide();
    this.motorInventoryService.modalOpen.next(false);
    this.motorModal.onHidden.subscribe(() => {
      this.emitClose.emit(true);
    });
  }

  selectMotor(motor: SuiteDbMotor) {
    this.motorModal.hide();
    this.motorInventoryService.modalOpen.next(false);
    this.motorModal.onHidden.subscribe(() => {
      this.emitSelect.emit(motor);
    });
  }

}
