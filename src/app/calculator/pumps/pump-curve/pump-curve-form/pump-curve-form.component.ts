import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PumpCurveForm, PumpCurveDataRow } from '../pump-curve';
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
  selectedFormView: string = 'Equation';
  constructor() { }

  ngOnInit() {
  }

  focusField(str: string){
    this.changeField.emit(str);
  }
}
