import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-boiler-efficiency-modal',
  templateUrl: './boiler-efficiency-modal.component.html',
  styleUrls: ['./boiler-efficiency-modal.component.css']
})
export class BoilerEfficiencyModalComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  containerHeight: number;
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<number>();

  @ViewChild('boilerEfficiencyModal', { static: false }) public boilerEfficiencyModal: ModalDirective;
  calcualtedCombustionEfficiency: number;
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

  setEfficiency(eff: number) {
    this.calcualtedCombustionEfficiency = eff;
  }

  save() {
    this.emitSave.emit(Number(this.calcualtedCombustionEfficiency.toFixed(2)));
  }
}
