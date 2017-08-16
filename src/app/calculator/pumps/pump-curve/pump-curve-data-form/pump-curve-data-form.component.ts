import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PumpCurveForm, PumpCurveDataRow } from '../pump-curve';

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

  constructor() { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
