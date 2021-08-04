import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-internal-dimension-modal',
  templateUrl: './internal-dimension-modal.component.html',
  styleUrls: ['./internal-dimension-modal.component.css']
})
export class InternalDimensionModalComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  dimension: string;

  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<number>();

  @ViewChild('internalDimensionModal', { static: false }) public boilerEfficiencyModal: ModalDirective;

  internalClearDimension: number = 0;
  inputs: { externalDimension: number, thickness: number } = { externalDimension: 0, thickness: 0 };
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showModal();
  }

  showModal() {
    this.boilerEfficiencyModal.show();
  }
  hideModal() {
    this.boilerEfficiencyModal.hide();
    this.emitClose.emit(true);
  }

  setInternalDimension(dimension: number) {
    this.internalClearDimension = dimension;
  }

  calculate() {
    this.internalClearDimension = this.inputs.externalDimension - (2 * this.inputs.thickness);
  }

  save() {
    this.emitSave.emit(Number(this.internalClearDimension.toFixed(2)));
  }
}
