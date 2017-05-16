import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-motor-help',
  templateUrl: './motor-help.component.html',
  styleUrls: ['./motor-help.component.css']
})
export class MotorHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;

  rpmMin: number = 0;
  rpmMax: number = 0;


  flaExpectedMin: number = 0;
  flaExpectedMax: number = 0;

  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.getRpmRange();
    this.getExpectedRange();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.psat) {
      this.getRpmRange();
      this.getExpectedRange()
    }
  }

  getRpmRange() {
    let rpmRange = this.psatService.getMotorRpmMinMax(this.psat.inputs.line_frequency);
    this.rpmMax = rpmRange.max;
    this.rpmMin = rpmRange.min;
  }


  getExpectedRange() {
    //estFLA expects psat form elements in argument
    let tmpForm = this.psatService.getFormFromPsat(this.psat.inputs);
    let tmpEfficiency = this.psatService.getEfficiencyFromForm(tmpForm);
    let estimatedFLA = this.psatService.estFLA(
      tmpForm.value.horsePower,
      tmpForm.value.motorRPM,
      tmpForm.value.frequency,
      tmpForm.value.efficiencyClass,
      tmpEfficiency,
      tmpForm.value.motorVoltage,
      this.settings
    );
    this.flaExpectedMax = estimatedFLA * 1.05;
    this.flaExpectedMin = estimatedFLA * .95;
  }
}
