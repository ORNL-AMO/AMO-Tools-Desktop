import { Component, OnInit, Input } from '@angular/core';
import { PsychrometricResults } from '../models/fans';
import { Subscription } from 'rxjs';
import { Settings } from '../models/settings';
import { GasDensityFormService } from '../../calculator/fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { CompareService } from '../../fsat/compare.service';
import { FanPsychrometricService, FanPsychrometricWarnings } from '../../calculator/process-cooling/fan-psychrometric/fan-psychrometric.service';


@Component({
    selector: 'app-gas-density-results',
    templateUrl: './gas-density-results.component.html',
    styleUrls: ['./gas-density-results.component.css'],
    standalone: false
})
export class GasDensityResultsComponent implements OnInit {
  @Input() inSetup: boolean;
  @Input() settings: Settings;

  baselineGasDensitySubscription: Subscription;
  modificationGasDensitySubscription: Subscription;
  modificationCalculationTypeSubscription: Subscription;
  baselineCalculationTypeSubscription: Subscription;
  selectedModificationSubscription: Subscription;

  baselinePsychrometricResults: PsychrometricResults;
  modPsychrometricResults: PsychrometricResults;
  isBaselineTypeCustom: boolean;
  isModificationTypeCustom: boolean;

  modificationName: string;
  baselineWarnings: FanPsychrometricWarnings;
  modificationWarnings: FanPsychrometricWarnings;

  constructor(
    private gasDensityFormService: GasDensityFormService, private compareService: CompareService, private fanPsychrometricService: FanPsychrometricService) { }

  ngOnInit(): void {
    this.modificationGasDensitySubscription = this.gasDensityFormService.modificationPsychrometricResults.subscribe(val => {
      this.modPsychrometricResults = val;
      this.modificationWarnings = this.fanPsychrometricService.checkWarnings(val);
    });
    this.modificationCalculationTypeSubscription = this.gasDensityFormService.modificationCalculationType.subscribe(val => {
      this.isModificationTypeCustom = (val === 'custom');
    });

    this.baselineGasDensitySubscription = this.gasDensityFormService.baselinePsychrometricResults.subscribe(val => {
      this.baselinePsychrometricResults = val;
      this.baselineWarnings = this.fanPsychrometricService.checkWarnings(val);
    });
    this.baselineCalculationTypeSubscription = this.gasDensityFormService.baselineCalculationType.subscribe(val => {
      this.isBaselineTypeCustom = (val === 'custom');
    });

    this.selectedModificationSubscription = this.compareService.selectedModification.subscribe(val => {
      if (val && !this.inSetup) {
        this.modificationName = val.name;
      } else {
        this.modificationName = undefined;
      }
    });
  }


  ngOnDestroy() {
    this.baselineGasDensitySubscription.unsubscribe();
    this.modificationGasDensitySubscription.unsubscribe();
    this.modificationCalculationTypeSubscription.unsubscribe();
    this.baselineCalculationTypeSubscription.unsubscribe();
    this.selectedModificationSubscription.unsubscribe();
  }
}
