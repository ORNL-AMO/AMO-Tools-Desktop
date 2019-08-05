import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FanAnalysisService } from '../../../calculator/fans/fan-analysis/fan-analysis.service';
import { ConvertFanAnalysisService } from '../../../calculator/fans/fan-analysis/convert-fan-analysis.service';
import { Subscription } from 'rxjs';
import { FSAT } from '../../../shared/models/fans';

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

  stepTab: string;
  stepTabSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService, private convertFanAnalysisService: ConvertFanAnalysisService) { }

  ngOnInit() {
    this.fanAnalysisService.inAssessmentModal = true;
    this.fanAnalysisService.inputData = this.fanAnalysisService.getExampleData();
    this.fanAnalysisService.inputData = this.convertFanAnalysisService.convertFan203Inputs(this.fanAnalysisService.inputData, this.settings);

    if (this.fsat.fieldData.fanRatedInfo) {
      this.fanAnalysisService.inputData.FanRatedInfo = this.fsat.fieldData.fanRatedInfo;
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
    })
  }

  ngOnDestroy() {
    this.stepTabSubscription.unsubscribe();
  }

}
