import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PumpCurveForm, PumpCurveDataRow } from '../../../../shared/models/calculators';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
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
    this.initMaxFlowWarnings();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  checkFlow(index: number) {
    let calculate = true;
    if (this.pumpCurveForm.dataRows[index].flow > 1000000) {
      this.maxFlowWarnings[index] = "Value must not be greater than 1,000,000.";
    }
    else {
      this.maxFlowWarnings[index] = null;
    }
    for (let i = 0; i < this.maxFlowWarnings.length; i++) {
      if (this.maxFlowWarnings[i] != null) {
        calculate = false;
      }
    }
    if (calculate) {
      this.emitCalculateChanges();
    }
  }

  initMaxFlowWarnings() {
    for (let i = 0; i < this.pumpCurveForm.dataRows.length; i++) {
      if (this.pumpCurveForm.dataRows[i].flow > 1000000) {
        this.maxFlowWarnings.push("Value must not be greater than 1,000,000.");
      }
      else {
        this.maxFlowWarnings.push(null);
      }
    }
  }

  removeRow(num: number) {
    this.pumpCurveForm.dataRows.splice(num, 1);
    this.maxFlowWarnings.splice(num, 1);
    this.emitCalculateChanges();
  }

  emitCalculateChanges() {
    this.calculate.emit(true);
  }

  addRow() {
    this.maxFlowWarnings.push(null);
    this.emitAddRow.emit(true);
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
