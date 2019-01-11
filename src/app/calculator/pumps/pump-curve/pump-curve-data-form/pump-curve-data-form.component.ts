import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PumpCurve, PumpCurveDataRow } from '../../../../shared/models/calculators';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-pump-curve-data-form',
  templateUrl: './pump-curve-data-form.component.html',
  styleUrls: ['./pump-curve-data-form.component.css']
})
export class PumpCurveDataFormComponent implements OnInit {
  @Input()
  pumpCurveForm: FormGroup;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('calculate')
  calculate = new EventEmitter<FormGroup>();
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  @Output('emitAddRow')
  emitAddRow = new EventEmitter<FormGroup>();
  @Output('emitRemoveRow')
  emitRemoveRow = new EventEmitter<number>();
  @Input()
  isFan: boolean;

  dataForm: any;
  orderOptions: Array<number> = [
    2, 3, 4, 5, 6
  ]
  //regEquation: string = null;
  //rSq: string = null;
  maxFlowWarnings: Array<string> = [];
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }


  removeRow(index: number) {
    this.emitRemoveRow.emit(index);
  }

  emitCalculateChanges() {
    this.calculate.emit(this.pumpCurveForm);
  }

  addRow() {
    this.emitAddRow.emit(this.pumpCurveForm);
  }


  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }
}
