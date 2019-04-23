import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OuterSubscriber } from 'rxjs/OuterSubscriber';
import { NaturalGasReductionResults, NaturalGasReductionService } from '../natural-gas-reduction.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-natural-gas-reduction-form',
  templateUrl: './natural-gas-reduction-form.component.html',
  styleUrls: ['./natural-gas-reduction-form.component.css']
})
export class NaturalGasReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  form: FormGroup;
  @Input()
  index: number;
  @Input()
  isBaseline: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<{ form: FormGroup, index: number, isBaseline: boolean }>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  measurementOptions: Array<{ value: number, name: string }>;
  idString: string;
  individualResults: NaturalGasReductionResults;
  format: any;

  constructor(private naturalGasReductionService: NaturalGasReductionService) { }

  ngOnInit() {
    this.getFormat();
    if (this.isBaseline) {
      this.idString = this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.initMeasurementOptions();
    this.calculate();
  }

  initMeasurementOptions() {
    this.measurementOptions = new Array<{ value: number, name: string }>();
    this.measurementOptions.push({ value: 0, name: 'Flow Meter Method' });
    this.measurementOptions.push({ value: 1, name: 'Mass Flow of Air' });
    this.measurementOptions.push({ value: 2, name: 'Mass Flow of Water' });
    this.measurementOptions.push({ value: 3, name: 'Offsheet / Other Method' });
  }

  changeMeasurementMethod() {
    let tmpObject = this.naturalGasReductionService.getObjFromForm(this.form);
    this.form = this.naturalGasReductionService.getFormFromObj(tmpObject);
    this.calculate();
  }

  calculate() {
    if (this.form.valid) {
      let emitObj = {
        form: this.form,
        index: this.index,
        isBaseline: this.isBaseline
      };
      this.emitCalculate.emit(emitObj);
      this.individualResults = this.naturalGasReductionService.calculateIndividualEquipment(this.naturalGasReductionService.getObjFromForm(this.form));
    }
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  focusOut() {

  }

  getFormat(): any {
    this.format = d3.format(',.3f');
  }

}
