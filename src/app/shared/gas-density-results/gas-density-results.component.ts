import { Component, OnInit, Input } from '@angular/core';
import { CalculatedGasDensity, FSAT } from '../models/fans';
import { Subscription } from 'rxjs';
import { Settings } from '../models/settings';
import { GasDensityFormService } from '../../calculator/fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';


@Component({
  selector: 'app-gas-density-results',
  templateUrl: './gas-density-results.component.html',
  styleUrls: ['./gas-density-results.component.css']
})
export class GasDensityResultsComponent implements OnInit {
  @Input() inSetup: boolean;
  @Input() settings: Settings;
  @Input() fsat: FSAT;
  @Input() modificationIndex: number;

  baselineUpdatedGasDensitySubscription: Subscription;
  modUpdatedGasDensitySubscription: Subscription;
  updateDataSubscription: Subscription;
  customDensityInputTypeSubscription: Subscription;

  baselineCalculatedGasDensity: CalculatedGasDensity;
  modCalculatedGasDensity: CalculatedGasDensity;
  customDensityInputType: boolean;
  modificationName: string;
  inAnalysis: boolean;
  inModifyAll: boolean;
  // showBaselineResult: boolean;
  // showModificationResult: boolean;

  constructor(
    private gasDensityFormService: GasDensityFormService) { }

  ngOnInit(): void {
    this.getDensityResults();
    if (!this.inSetup && !this.fsat) {
      this.inAnalysis = true;
    } else if (!this.inSetup && this.fsat) {
      this.inModifyAll = true;
      this.modificationName = this.fsat.modifications[this.modificationIndex].fsat.name;
    }
  }

  // Pull display logic out of template
  // updateView() {
  //   if (!this.inSetup && !this.fsat) {
  //     this.inAnalysis = true;
  //   } else if (!this.inSetup && this.fsat) {
  //     this.inModifyAll = true;
  //     this.modificationName = this.fsat.modifications[this.modificationIndex].fsat.name;
  //     this.showModificationResult = this.modCalculatedGasDensity && this.fsat.modifications[this.modificationIndex].fsat.baseGasDensity.inputType != 'custom'
  //     this.showBaselineResult = this.baselineCalculatedGasDensity && this.fsat.baseGasDensity.inputType != 'custom';
  //   } else {
  //     this.showBaselineResult = this.baselineCalculatedGasDensity && this.fsat.baseGasDensity.inputType != 'custom';
  //     this.showModificationResult = false;
  //   }
  // }

  getDensityResults() {
    this.baselineUpdatedGasDensitySubscription = this.gasDensityFormService.baselineUpdatedGasDensity.subscribe(updatedValue => {
        this.baselineCalculatedGasDensity = updatedValue;
    });
    this.modUpdatedGasDensitySubscription = this.gasDensityFormService.modUpdatedGasDensity.subscribe(updatedValue => {
        this.modCalculatedGasDensity = updatedValue;
    });
    this.customDensityInputTypeSubscription = this.gasDensityFormService.customDensityInputType.subscribe(isCustomMethod => {
      this.customDensityInputType = isCustomMethod;
    });
  }

  ngOnDestroy() {
    this.baselineUpdatedGasDensitySubscription.unsubscribe();
    this.modUpdatedGasDensitySubscription.unsubscribe();
    this.customDensityInputTypeSubscription.unsubscribe();
  }

}
