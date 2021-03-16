import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FanAnalysisService } from '../../../calculator/fans/fan-analysis/fan-analysis.service';
import { ConvertFanAnalysisService } from '../../../calculator/fans/fan-analysis/convert-fan-analysis.service';
import { Subscription } from 'rxjs';
import { FieldData, FSAT, PlaneResults } from '../../../shared/models/fans';
import { FanInfoFormService } from '../../../calculator/fans/fan-analysis/fan-analysis-form/fan-info-form/fan-info-form.service';
import { PlaneDataFormService } from '../../../calculator/fans/fan-analysis/fan-analysis-form/plane-data-form/plane-data-form.service';

@Component({
  selector: 'app-calculate-flow-pressure',
  templateUrl: './calculate-flow-pressure.component.html',
  styleUrls: ['./calculate-flow-pressure.component.css']
})
export class CalculateFlowPressureComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  bodyHeight: number;
  @Input()
  fsat: FSAT;
  @Output('updateFieldData')
  updateFieldData = new EventEmitter<FieldData>();
  @Output('emitInvalid')
  emitInvalid = new EventEmitter<boolean>();

  stepTab: string;
  stepTabSubscription: Subscription;
  getResultsSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService, 
              private convertFanAnalysisService: ConvertFanAnalysisService, 
              private fanInfoFormService: FanInfoFormService, 
              private planeDataFormService: PlaneDataFormService,
              ) { }

  ngOnInit() {
    this.fanAnalysisService.inAssessmentModal = true;
    this.fanAnalysisService.inputData = this.fanAnalysisService.getExampleData();
    this.fanAnalysisService.inputData = this.convertFanAnalysisService.convertFan203Inputs(this.fanAnalysisService.inputData, this.settings);

    if (this.fsat.baseGasDensity) {
      this.fanAnalysisService.inputData.BaseGasDensity = this.fsat.baseGasDensity;
    }
    if (this.fsat.fieldData.fanRatedInfo) {
      this.fanAnalysisService.inputData.FanRatedInfo = this.fsat.fieldData.fanRatedInfo;
      this.fanAnalysisService.inputData.FanRatedInfo.fanSpeedCorrected = this.fsat.fieldData.fanRatedInfo.fanSpeed
      this.fanAnalysisService.inputData.FanRatedInfo.pressureBarometricCorrected = this.fsat.fieldData.fanRatedInfo.globalBarometricPressure;
      this.fanAnalysisService.inputData.FanRatedInfo.densityCorrected = this.fsat.baseGasDensity.gasDensity;
    }
    if (this.fsat.fieldData.planeData) {
      this.fanAnalysisService.inputData.PlaneData = this.fsat.fieldData.planeData;
    }
    if (!this.fsat.fieldData.pressureCalcResultType) {
      this.fsat.fieldData.pressureCalcResultType = 'static';
    }

    this.fanAnalysisService.inputData.FanRatedInfo.fanSpeed = this.fsat.fanSetup.fanSpeed;
    this.fanAnalysisService.inputData.FanRatedInfo.globalBarometricPressure = this.fsat.baseGasDensity.barometricPressure;
    this.fanAnalysisService.inputData.FanRatedInfo.motorSpeed = this.fsat.fanMotor.motorRpm;
    
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.stepTab = val;
    });
    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.getResults();
    })
  }

  ngOnDestroy() {
    this.stepTabSubscription.unsubscribe();
    this.getResultsSubscription.unsubscribe();
    this.fanAnalysisService.inputData = undefined;
    this.fanAnalysisService.stepTab.next('fan-info');
    this.fanAnalysisService.mainTab.next('fan-setup');
  }

  getResults() {
    this.fsat.fieldData.fanRatedInfo = this.fanAnalysisService.inputData.FanRatedInfo;
    this.fsat.fieldData.planeData = this.fanAnalysisService.inputData.PlaneData;
    let fanInfoDone: boolean = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings).valid;
    let planeDataDone: boolean = this.planeDataFormService.checkPlaneDataValid(this.fanAnalysisService.inputData.PlaneData, this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
    if (planeDataDone && fanInfoDone) {
      let planeResults: PlaneResults = this.convertFanAnalysisService.getPlaneResults(this.fanAnalysisService.inputData, this.settings);
      this.fsat.fieldData.flowRate = Number(planeResults.FanInletFlange.gasVolumeFlowRate.toFixed(3));
      if (this.fanAnalysisService.pressureCalcResultType == 'static') {
        this.fsat.fieldData.inletPressure = Number(planeResults.FanInletFlange.staticPressure.toFixed(3));
        this.fsat.fieldData.outletPressure = Number(planeResults.FanOrEvaseOutletFlange.staticPressure.toFixed(3));
      } else if (this.fanAnalysisService.pressureCalcResultType == 'total') {
        this.fsat.fieldData.inletPressure = Number(planeResults.FanInletFlange.gasTotalPressure.toFixed(3));
        this.fsat.fieldData.outletPressure = Number(planeResults.FanOrEvaseOutletFlange.gasTotalPressure.toFixed(3));
      }
      this.emitInvalid.emit(false);
    } else {
      this.emitInvalid.emit(true);
    }
    this.updateFieldData.emit(this.fsat.fieldData);
  }
}
