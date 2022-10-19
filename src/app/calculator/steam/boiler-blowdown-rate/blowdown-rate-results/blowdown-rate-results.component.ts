import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BoilerBlowdownRateService, BoilerBlowdownRateResults, BoilerBlowdownRateInputs } from '../boiler-blowdown-rate.service';
import { Subscription } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-blowdown-rate-results',
  templateUrl: './blowdown-rate-results.component.html',
  styleUrls: ['./blowdown-rate-results.component.css']
})
export class BlowdownRateResultsComponent implements OnInit {
  @Input()
  settings: Settings;

  baselineSub: Subscription;
  modificationSub: Subscription;
  baselineResults: BoilerBlowdownRateResults;
  modificationResults: BoilerBlowdownRateResults;
  modificationExists: boolean;
  showBoilerSubscription: Subscription;
  showBoiler: boolean;
  showOperationsSubscription: Subscription;
  showOperations: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;
  constructor(private boilerBlowdownRateService: BoilerBlowdownRateService) { }

  ngOnInit() {
    this.showBoilerSubscription = this.boilerBlowdownRateService.showBoiler.subscribe(val => {
      this.showBoiler = val;
      this.calculateResults();
    });
    this.showOperationsSubscription = this.boilerBlowdownRateService.showOperations.subscribe(val => {
      this.showOperations = val;
      this.calculateResults();
    });
    this.baselineSub = this.boilerBlowdownRateService.baselineInputs.subscribe(val => {
      this.calculateBaselineResults();
    });

    this.modificationSub = this.boilerBlowdownRateService.modificationInputs.subscribe(val => {
      this.calculateModificationResults();
    });
  }

  ngOnDestroy() {
    this.baselineSub.unsubscribe();
    this.modificationSub.unsubscribe();
    this.showBoilerSubscription.unsubscribe();
    this.showOperationsSubscription.unsubscribe();
  }

  getEmptyResults(): BoilerBlowdownRateResults {
    return {
      blowdownRate: 0,
      boilerFuelCost: 0,
      makeupWaterCost: 0,
      totalCost: 0,
      blowdownFlowRate: 0,
      feedwaterFlowRate: 0
    }
  }

  calculateResults() {
    this.calculateBaselineResults();
    this.calculateModificationResults();
  }

  calculateModificationResults() {
    let modificationInputs: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.modificationInputs.getValue();
    if (modificationInputs) {
      this.modificationExists = true;
      let conductivityForm: UntypedFormGroup = this.boilerBlowdownRateService.getConductivityFormFromObj(modificationInputs);
      let boilerForm: UntypedFormGroup = this.boilerBlowdownRateService.getBoilerFormFromObj(modificationInputs, this.settings);
      let operationsForm: UntypedFormGroup = this.boilerBlowdownRateService.getOperationsFormFromObj(modificationInputs, this.settings);
      if (conductivityForm.valid) {
        let calcBoilerResults: boolean = boilerForm.valid && this.showBoiler;
        let calcOperations: boolean = boilerForm.valid && operationsForm.valid && this.showOperations;
        this.modificationResults = this.boilerBlowdownRateService.calculateResults(modificationInputs, this.settings, calcBoilerResults, calcOperations);
      } else {
        this.modificationResults = this.getEmptyResults();
      }
    } else {
      this.modificationExists = false;
      this.modificationResults = this.getEmptyResults();
      this.modificationExists = false;
    }
  }

  calculateBaselineResults() {
    let baselineInputs: BoilerBlowdownRateInputs = this.boilerBlowdownRateService.baselineInputs.getValue();
    if (baselineInputs) {
      let conductivityForm: UntypedFormGroup = this.boilerBlowdownRateService.getConductivityFormFromObj(baselineInputs);
      let boilerForm: UntypedFormGroup = this.boilerBlowdownRateService.getBoilerFormFromObj(baselineInputs, this.settings);
      let operationsForm: UntypedFormGroup = this.boilerBlowdownRateService.getOperationsFormFromObj(baselineInputs, this.settings);
      if (conductivityForm.valid) {
        let calcBoilerResults: boolean = boilerForm.valid && this.showBoiler;
        let calcOperations: boolean = boilerForm.valid && operationsForm.valid && this.showOperations;
        this.baselineResults = this.boilerBlowdownRateService.calculateResults(baselineInputs, this.settings, calcBoilerResults, calcOperations);
      } else {
        this.baselineResults = this.getEmptyResults();
      }
    } else {
      this.baselineResults = this.getEmptyResults();
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
