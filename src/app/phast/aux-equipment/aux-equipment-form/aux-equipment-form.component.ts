import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuxEquipment } from '../../../shared/models/phast/auxEquipment';
@Component({
  selector: 'app-aux-equipment-form',
  templateUrl: './aux-equipment-form.component.html',
  styleUrls: ['./aux-equipment-form.component.css']
})
export class AuxEquipmentFormComponent implements OnInit {
  @Input()
  equipment: AuxEquipment;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  // @Input()
  // settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  counter: any;
  voltageError: string = null;
  constructor() { }

  ngOnInit() {
  }

  checkVoltageError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
      this.emitCalculate.emit(true);
    }
    if (this.equipment.supplyVoltage < 0 || this.equipment.supplyVoltage > 480) {
      this.voltageError = 'Supply Voltage must be between 0 and 480';
    } else {
      this.voltageError = null;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  calculate() {
    this.startSavePolling();
    this.emitCalculate.emit(true);
  }

  startSavePolling() {
    this.emitSave.emit(true);
  }
}
