import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FanAnalysisService } from '../fan-analysis.service';
import { Subscription } from 'rxjs';
import { PlaneDataFormService } from '../fan-analysis-form/plane-data-form/plane-data-form.service';
import { FanInfoFormService } from '../fan-analysis-form/fan-info-form/fan-info-form.service';
import { GasDensityFormService } from '../fan-analysis-form/gas-density-form/gas-density-form.service';
import { FanShaftPowerFormService } from '../fan-analysis-form/fan-shaft-power-form/fan-shaft-power-form.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-fan-analysis-banner',
    templateUrl: './fan-analysis-banner.component.html',
    styleUrls: ['./fan-analysis-banner.component.css'],
    standalone: false
})
export class FanAnalysisBannerComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inAssessment: boolean;
  @Output('emitChangeTabs')
  emitChangeTabs = new EventEmitter<string>();

  mainTab: string;
  mainTabSubscription: Subscription;
  stepTab: string;
  stepTabSubscription: Subscription;
  planeDataClassStatus: Array<string> = [];
  basicsClassStatus: Array<string> = [];
  gasClassStatus: Array<string> = [];
  shaftPowerClassStatus: Array<string> = [];
  resultsTabClassStatus: Array<string> = [];
  getResultsSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService, private planeDataFormService: PlaneDataFormService,
    private fanInfoFormService: FanInfoFormService, private gasDensityFormService: GasDensityFormService, private fanShaftPowerFormService: FanShaftPowerFormService) { }

  ngOnInit() {
    this.mainTabSubscription = this.fanAnalysisService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.updateClassArrays();
    });
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.updateClassArrays();
    });
    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.updateClassArrays();
    })
  }

  ngOnDestroy() {
    this.mainTabSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.getResultsSubscription.unsubscribe();
  }

  changeTab(str: string) {
    this.fanAnalysisService.mainTab.next(str);
  }

  changeStepTab(str: string) {
    if (str != 'fan-analysis-results') {
      this.fanAnalysisService.stepTab.next(str);
    } else if (this.resultsTabClassStatus[0] != 'disabled') {
      this.fanAnalysisService.stepTab.next(str);
    }
  }

  updateClassArrays() {
    this.checkResultsStatus();
    this.checkPlaneData();
    this.checkBasics();
    this.checkGasDone();
    this.checkShaftPower();
  }

  checkPlaneData() {
    let planeDataDone: boolean = this.planeDataFormService.checkPlaneDataValid(this.fanAnalysisService.inputData.PlaneData, this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
    if (!planeDataDone) {
      this.planeDataClassStatus = ['missing-data'];
    } else {
      this.planeDataClassStatus = [];
    }
    if (this.stepTab === 'plane-data') {
      this.planeDataClassStatus.push('active');
    }
  }

  checkBasics() {
    let basicsDone: boolean = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings).valid;
    if (!basicsDone) {
      this.basicsClassStatus = ['missing-data'];
    } else {
      this.basicsClassStatus = [];
    }
    if (this.stepTab === 'fan-info') {
      this.basicsClassStatus.push('active');
    }
  }

  checkGasDone() {
    let gasDone: boolean = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings).valid;
    if (!gasDone) {
      this.gasClassStatus = ['missing-data'];
    } else {
      this.gasClassStatus = [];
    }
    if (this.stepTab === 'gas-density') {
      this.gasClassStatus.push('active');
    }
  }

  checkShaftPower() {
    let shaftPowerDone: boolean = this.fanShaftPowerFormService.getShaftPowerFormFromObj(this.fanAnalysisService.inputData.FanShaftPower).valid;
    if (!shaftPowerDone) {
      this.shaftPowerClassStatus = ['missing-data'];
    } else {
      this.shaftPowerClassStatus = [];
    }
    if (this.stepTab === 'fan-shaft-power') {
      this.shaftPowerClassStatus.push('active');
    }
  }

  checkResultsStatus() {
    let shaftPowerDone: boolean = this.fanShaftPowerFormService.getShaftPowerFormFromObj(this.fanAnalysisService.inputData.FanShaftPower).valid;
    let gasDone: boolean = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings).valid;
    let basicsDone: boolean = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings).valid;
    let planeDataDone: boolean = this.planeDataFormService.checkPlaneDataValid(this.fanAnalysisService.inputData.PlaneData, this.fanAnalysisService.inputData.FanRatedInfo, this.settings);

    if (shaftPowerDone != true || gasDone != true || basicsDone != true || planeDataDone != true) {
      this.resultsTabClassStatus = ['disabled']
    } else {
      this.resultsTabClassStatus = [];
    }
    if (this.stepTab == 'fan-analysis-results') {
      this.resultsTabClassStatus.push('active');
    }
  }

  changeTabNextOrBack(str: string){
    this.emitChangeTabs.emit(str);
  }

}
