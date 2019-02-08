import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { ElectricityReductionService } from '../electricity-reduction.service';


@Component({
  selector: 'app-electricity-reduction-form',
  templateUrl: './electricity-reduction-form.component.html',
  styleUrls: ['./electricity-reduction-form.component.css']
})
export class ElectricityReductionFormComponent implements OnInit {
  @Input()
  form: FormGroup;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Input()
  isBaseline: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FormGroup>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  measurementOptions: Array<{ value: number, name: string }>;

  constructor(private electricityReductionService: ElectricityReductionService) { }

  ngOnInit() {
    this.initMeasurementOptions();
  }

  initMeasurementOptions() {
    this.measurementOptions = new Array<{ value: number, name: string }>();
    this.measurementOptions.push({ value: 0, name: 'Multimeter Reading' });
    this.measurementOptions.push({ value: 1, name: 'Name Plate Data' });
    this.measurementOptions.push({ value: 2, name: 'Power Meter Method' });
    this.measurementOptions.push({ value: 3, name: 'Offsheet / Other Method' });
  }

  calculate() {
    console.log('calculate()');
    let tmpObject = this.electricityReductionService.getObjFromForm(this.form, this.index, this.isBaseline);
    this.form = this.electricityReductionService.getFormFromObj(tmpObject);

  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  focusOut() {
    console.log('focusOut()');
  }
}
