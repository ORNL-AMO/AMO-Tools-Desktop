import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-water-cooling-losses-form',
  templateUrl: './water-cooling-losses-form.component.html',
  styleUrls: ['./water-cooling-losses-form.component.css']
})
export class WaterCoolingLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
  @Output('calculateBaseline')
  calculateBaseline = new EventEmitter<boolean>();
  @Output('calculateModified')
  calculateModified = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  checkBaseline() {
    if (
      this.lossesForm.controls.baselineCoolingMedium == 'VALID' &&
      this.lossesForm.controls.baselineAvgSpecificHeat == 'VALID' &&
      this.lossesForm.controls.baselineDensity == 'VALID' &&
      this.lossesForm.controls.baselineFlow == 'VALID' &&
      this.lossesForm.controls.baselineInletTemp == 'VALID' &&
      this.lossesForm.controls.baselineOutletTemp == 'VALID' &&
      this.lossesForm.controls.baselineHeatRequired == 'VALID' &&
      this.lossesForm.controls.baselineCorrectionFactor == 'VALID'
    ) {
      this.calculateBaseline.emit(true);
    }
  }

  checkModified() {
    if (
      this.lossesForm.controls.modifiedCoolingMedium == 'VALID' &&
      this.lossesForm.controls.modifiedAvgSpecificHeat == 'VALID' &&
      this.lossesForm.controls.modifiedDensity == 'VALID' &&
      this.lossesForm.controls.modifiedFlow == 'VALID' &&
      this.lossesForm.controls.modifiedInletTemp == 'VALID' &&
      this.lossesForm.controls.modifiedOutletTemp == 'VALID' &&
      this.lossesForm.controls.modifiedHeatRequired == 'VALID' &&
      this.lossesForm.controls.modifiedCorrectionFactor == 'VALID'
    ) {
      this.calculateModified.emit(true);
    }
  }

}
