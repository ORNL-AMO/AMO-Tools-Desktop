import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { ElectricityReductionService } from '../electricity-reduction.service';
import { ElectricityReductionResults } from '../../../../shared/models/standalone';


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
  emitCalculate = new EventEmitter<{ form: FormGroup, index: number, isBaseline: boolean }>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  measurementOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Multimeter Reading' },
    { value: 1, name: 'Name Plate Data' },
    { value: 2, name: 'Power Meter Method' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  idString: string;

  individualResults: ElectricityReductionResults;

  constructor(private electricityReductionService: ElectricityReductionService) { }

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
    let tmpObject = this.electricityReductionService.getObjFromForm(this.form);
    this.form = this.electricityReductionService.getFormFromObj(tmpObject);
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
      this.individualResults = this.electricityReductionService.calculateIndividualEquipment(this.electricityReductionService.getObjFromForm(this.form), this.settings);
      this.individualResults = {
        energyUse: this.individualResults.energyUse,
        energyCost: this.individualResults.energyCost,
        annualEnergySavings: this.individualResults.annualEnergySavings,
        costSavings: this.individualResults.costSavings,
        power: this.individualResults.power
      };
    }
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  focusOut() {
  }
}
