import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PumpCurveForm, PumpCurveDataRow } from '../pump-curve';
import * as regression from 'regression';
import { PumpCurveService } from '../pump-curve.service';
@Component({
  selector: 'app-pump-curve-form',
  templateUrl: './pump-curve-form.component.html',
  styleUrls: ['./pump-curve-form.component.css']
})
export class PumpCurveFormComponent implements OnInit {
  @Input()
  pumpCurveForm: PumpCurveForm;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  selectedFormView: string;

  options: Array<string> = [
    'Diameter',
    'Speed'
  ]


  constructor(private pumpCurveService: PumpCurveService) { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  addRow() {
    let tmpRow: PumpCurveDataRow = {
      head: 0,
      flow: 0
    }
    this.pumpCurveForm.dataRows.push(tmpRow)
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  setView(){
    this.pumpCurveService.calcMethod.next(this.selectedFormView);
  }

  estimateHead() {
    if (this.selectedFormView == 'Data') {
      let tmpArr = new Array<any>();
      this.pumpCurveForm.dataRows.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: this.pumpCurveForm.dataOrder, precision: 10 });
      let newVal = results.predict(this.pumpCurveForm.exploreFlow);
      this.pumpCurveForm.exploreHead = newVal[1];
    } else if (this.selectedFormView == 'Equation') {
      let result = 0;
      result = this.pumpCurveForm.headConstant + this.pumpCurveForm.headFlow * this.pumpCurveForm.exploreFlow + this.pumpCurveForm.headFlow2 * Math.pow(this.pumpCurveForm.exploreFlow, 2) + this.pumpCurveForm.headFlow3 * Math.pow(this.pumpCurveForm.exploreFlow, 3) + this.pumpCurveForm.headFlow4 * Math.pow(this.pumpCurveForm.exploreFlow, 4) + this.pumpCurveForm.headFlow5 * Math.pow(this.pumpCurveForm.exploreFlow, 5) + this.pumpCurveForm.headFlow6 * Math.pow(this.pumpCurveForm.exploreFlow, 6);
      this.pumpCurveForm.exploreHead = result;
    }
  }

  estimateFlow() {
    if (this.selectedFormView == 'Data') {
      let tmpArr = new Array<any>();
      this.pumpCurveForm.dataRows.forEach(val => {
        tmpArr.push([val.head, val.flow]);
      })
      let results = regression.polynomial(tmpArr, { order: this.pumpCurveForm.dataOrder, precision: 10 });
      let newVal = results.predict(this.pumpCurveForm.exploreHead);
      this.pumpCurveForm.exploreFlow = newVal[1];
    } else {
      let tmpArr = this.genHeadData();
      let regResult = regression.polynomial(tmpArr, { order: this.pumpCurveForm.dataOrder, precision: 10 });
      let newVal = regResult.predict(this.pumpCurveForm.exploreHead);
      this.pumpCurveForm.exploreFlow = newVal[1];
    }
  }

  genHeadData() {
    let tmpArr = new Array<any>();
    for (let i = 0; i < this.pumpCurveForm.maxFlow; i = i + 10) {
      let result = this.pumpCurveForm.headConstant + this.pumpCurveForm.headFlow * i + this.pumpCurveForm.headFlow2 * Math.pow(i, 2) + this.pumpCurveForm.headFlow3 * Math.pow(i, 3) + this.pumpCurveForm.headFlow4 * Math.pow(i, 4) + this.pumpCurveForm.headFlow5 * Math.pow(i, 5) + this.pumpCurveForm.headFlow6 * Math.pow(i, 6);
      if (result > 0) {
        tmpArr.push([result, i]);
      }
    }
    return tmpArr;
  }
}
