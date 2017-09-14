import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PumpCurveForm, PumpCurveDataRow } from '../pump-curve';

import * as regression from 'regression';
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

  orderOptions: Array<number> = [
    2,3,4,5,6
  ]
  regEquation: string = null;
  rSq: string = null;
  constructor() { }

  ngOnInit() {
    this.emitCalculateChanges();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  removeRow(num: number){
    this.pumpCurveForm.dataRows.splice(num, 1);
  }

  emitCalculateChanges(){
   this.calculate.emit(true);
   //console.log(this.pumpCurveForm.dataRows);
   let tmpArr = new Array<any>();
   this.pumpCurveForm.dataRows.forEach(val => {
     tmpArr.push([val.head, val.flow]);
   })
   let results = regression.polynomial(tmpArr, {order: this.pumpCurveForm.dataOrder, precision: 10});
   console.log(results);
   this.regEquation = results.string;
   this.rSq = results.r2;
   let test = results.predict(1020);
   console.log(test);
  //  let equation = regression.linear()
  }
}
