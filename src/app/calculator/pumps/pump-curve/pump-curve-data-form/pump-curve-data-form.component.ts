import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PumpCurveForm, PumpCurveDataRow } from '../pump-curve';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-pump-curve-data-form',
  templateUrl: './pump-curve-data-form.component.html',
  styleUrls: ['./pump-curve-data-form.component.css']
})
export class PumpCurveDataFormComponent implements OnInit {
  @Input()
  pumpCurveForm: PumpCurveForm;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  @Output('emitAddRow')
  emitAddRow = new EventEmitter<boolean>();

  dataForm: any;
  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ]
  //regEquation: string = null;
  //rSq: string = null;
  constructor() { }

  ngOnInit() { }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  removeRow(num: number) {
    this.pumpCurveForm.dataRows.splice(num, 1);
    this.emitCalculateChanges();
  }

  emitCalculateChanges() {
    this.calculate.emit(true);
  }

  addRow(){
    this.emitAddRow.emit(true);
  }
}
