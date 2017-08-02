import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuxEquipment } from '../../../shared/models/phast/auxEquipment';
@Component({
  selector: 'app-aux-equipment-form',
  templateUrl: './aux-equipment-form.component.html',
  styleUrls: ['./aux-equipment-form.component.css', '../../../psat/explore-opportunities/explore-opportunities-form/explore-opportunities-form.component.css']
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
  constructor() { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  calculate() {
    this.startSavePolling();
    this.emitCalculate.emit(true);
  }

  startSavePolling() {
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave.emit(true);
    }, 3000)
  }
}
