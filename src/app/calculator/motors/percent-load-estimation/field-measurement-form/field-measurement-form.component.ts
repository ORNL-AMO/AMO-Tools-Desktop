import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FieldMeasurementInputs } from '../percent-load-estimation.service';

@Component({
  selector: 'app-field-measurement-form',
  templateUrl: './field-measurement-form.component.html',
  styleUrls: ['./field-measurement-form.component.css']
})
export class FieldMeasurementFormComponent implements OnInit {
  @Input()
  data: FieldMeasurementInputs;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FieldMeasurementInputs>();

  amps: string = 'Amps';
  volts: string = 'Volts';
  constructor() { }

  ngOnInit() {
  }


  calculate() {
    this.emitCalculate.emit(this.data);
  }
}
