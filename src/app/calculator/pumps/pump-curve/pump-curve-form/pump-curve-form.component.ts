import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PumpCurve, PumpCurveDataRow } from '../../../../shared/models/calculators';
import * as regression from 'regression';
import { PumpCurveService } from '../pump-curve.service';
import { PsatService } from '../../../../psat/psat.service';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-pump-curve-form',
  templateUrl: './pump-curve-form.component.html',
  styleUrls: ['./pump-curve-form.component.css']
})
export class PumpCurveFormComponent implements OnInit {
  @Input()
  psat: PSAT;

  @Input()
  pumpCurveForm: FormGroup;

  // @Input()
  // pumpCurveForm: PumpCurveForm;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  @Input()
  selectedFormView: string;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;
  @Input()
  isFan: boolean;

  curveForm: any;
  options: Array<string> = [
    'Diameter',
    'Speed'
  ];
  smallUnit: string;
  modWarning: string = null;

  constructor(private pumpCurveService: PumpCurveService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.setSmallUnit();
  }

  setSmallUnit() {
    if (!this.isFan) {
      if (this.settings.distanceMeasurement == 'ft') {
        this.smallUnit = 'in';
      } else {
        this.smallUnit = 'cm';
      }
    }
    else {
      if (this.settings.fanFlowRate == 'ft3/min') {
        this.smallUnit = 'in';
      }
      else {
        this.smallUnit = 'cm';
      }
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  addRow() {
    let tmpRow: PumpCurveDataRow = {
      head: 0,
      flow: 0
    }
    this.pumpCurveForm = this.pumpCurveService.addDataRowToForm(tmpRow, this.pumpCurveForm);
    this.calculate();
  }

  removeRow(index: number) {
    this.pumpCurveForm = this.pumpCurveService.removeDataRowFromForm(index, this.pumpCurveForm);
    this.calculate();
  }

  calculate() {
    this.checkWarnings();
    if (this.modWarning == null) {
      this.emitCalculate.emit(this.pumpCurveForm);
    }
  }

  setView() {
    this.pumpCurveService.calcMethod.next(this.selectedFormView);
  }

  estimateHead() {
    if (this.selectedFormView == 'Data') {
      let tmpArr = new Array<any>();
      this.pumpCurveForm.controls.dataRows.value.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: this.pumpCurveForm.controls.dataOrder.value, precision: 10 });
      let newVal = results.predict(this.pumpCurveForm.controls.exploreFlow.value);
      this.pumpCurveForm.controls.exploreHead.patchValue(newVal[1]);
    } else if (this.selectedFormView == 'Equation') {
      let result = 0;
      result = this.pumpCurveForm.controls.headConstant.value + this.pumpCurveForm.controls.headFlow.value * this.pumpCurveForm.controls.exploreFlow.value + this.pumpCurveForm.controls.headFlow2.value * Math.pow(this.pumpCurveForm.controls.exploreFlow.value, 2) + this.pumpCurveForm.controls.headFlow3.value * Math.pow(this.pumpCurveForm.controls.exploreFlow.value, 3) + this.pumpCurveForm.controls.headFlow4.value * Math.pow(this.pumpCurveForm.controls.exploreFlow.value, 4) + this.pumpCurveForm.controls.headFlow5.value * Math.pow(this.pumpCurveForm.controls.exploreFlow.value, 5) + this.pumpCurveForm.controls.headFlow6.value * Math.pow(this.pumpCurveForm.controls.exploreFlow.value, 6);
      this.pumpCurveForm.controls.exploreHead.patchValue(result);
    }
  }

  estimateFlow() {
    if (this.selectedFormView == 'Data') {
      let tmpArr = new Array<any>();
      this.pumpCurveForm.controls.dataRows.value.forEach(val => {
        tmpArr.push([val.head, val.flow]);
      })
      let results = regression.polynomial(tmpArr, { order: this.pumpCurveForm.controls.dataOrder.value, precision: 10 });
      let newVal = results.predict(this.pumpCurveForm.controls.exploreHead.value);
      this.pumpCurveForm.controls.exploreFlow.patchValue(newVal[1]);
    } else {
      let tmpArr = this.genHeadData();
      let regResult = regression.polynomial(tmpArr, { order: this.pumpCurveForm.controls.dataOrder.value, precision: 10 });
      let newVal = regResult.predict(this.pumpCurveForm.controls.exploreHead.value);
      this.pumpCurveForm.controls.exploreFlow.patchValue(newVal[1]);
    }
  }

  genHeadData() {
    let tmpArr = new Array<any>();
    for (let i = 0; i < this.pumpCurveForm.controls.maxFlow.value; i = i + 10) {
      let result = this.pumpCurveForm.controls.headConstant.value + this.pumpCurveForm.controls.headFlow.value * i + this.pumpCurveForm.controls.headFlow2.value * Math.pow(i, 2) + this.pumpCurveForm.controls.headFlow3.value * Math.pow(i, 3) + this.pumpCurveForm.controls.headFlow4.value * Math.pow(i, 4) + this.pumpCurveForm.controls.headFlow5.value * Math.pow(i, 5) + this.pumpCurveForm.controls.headFlow6.value * Math.pow(i, 6);
      if (result > 0) {
        tmpArr.push([result, i]);
      }
    }
    return tmpArr;
  }

  changeMeasurementOption() {
    if (this.pumpCurveForm.controls.measurementOption.value == 0) {
      this.pumpCurveForm.controls.baselineMeasurement.patchValue(this.convertUnitsService.value(1).from('ft').to(this.smallUnit));
      this.pumpCurveForm.controls.modifiedMeasurement.patchValue(this.convertUnitsService.value(1).from('ft').to(this.smallUnit));
    }
    else {
      this.pumpCurveForm.controls.baselineMeasurement.patchValue(1800);
      this.pumpCurveForm.controls.modifiedMeasurement.patchValue(1800);
    }
    this.calculate();
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }


  checkWarnings() {
    if (this.pumpCurveForm.controls.modifiedMeasurement.value < (this.pumpCurveForm.controls.baselineMeasurement.value * .5) || this.pumpCurveForm.controls.modifiedMeasurement.value > (this.pumpCurveForm.controls.baselineMeasurement.value * 1.5)) {
      this.modWarning = "Modified value must be within +/-50% of the baseline value.";
    }
    else {
      this.modWarning = null;
    }
  }

}
