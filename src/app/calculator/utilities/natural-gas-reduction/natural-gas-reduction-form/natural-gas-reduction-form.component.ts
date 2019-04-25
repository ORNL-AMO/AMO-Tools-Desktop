import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { NaturalGasReductionService } from '../natural-gas-reduction.service';
import { NaturalGasReductionResults } from '../../../../shared/models/standalone';

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

  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Flow Meter Method' },
    { value: 1, name: 'Mass Flow of Air' },
    { value: 2, name: 'Mass Flow of Water' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  idString: string;
  individualResults: NaturalGasReductionResults;

  constructor(private naturalGasReductionService: NaturalGasReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = this.index.toString();
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.calculate();
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
      this.individualResults = this.naturalGasReductionService.calculateIndividualEquipment(this.naturalGasReductionService.getObjFromForm(this.form), this.settings);
    }
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  focusOut() {
  }
}
