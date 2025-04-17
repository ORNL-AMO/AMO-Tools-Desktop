import { Component, OnInit, Input } from '@angular/core';
import { Fan203Results } from '../../../../shared/models/fans';
import { FanAnalysisService } from '../fan-analysis.service';
import { FsatService } from '../../../../fsat/fsat.service';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { GasDensityFormService } from '../fan-analysis-form/gas-density-form/gas-density-form.service';
import { PlaneDataFormService } from '../fan-analysis-form/plane-data-form/plane-data-form.service';
import { FanShaftPowerFormService } from '../fan-analysis-form/fan-shaft-power-form/fan-shaft-power-form.service';
import { FanInfoFormService } from '../fan-analysis-form/fan-info-form/fan-info-form.service';

@Component({
    selector: 'app-fan-analysis-results',
    templateUrl: './fan-analysis-results.component.html',
    styleUrls: ['./fan-analysis-results.component.css'],
    standalone: false
})
export class FanAnalysisResultsComponent implements OnInit {
  @Input()
  settings: Settings

  tabSelect: string = 'results';
  results: Fan203Results;

  getResultsSub: Subscription;

  constructor(private fanAnalysisService: FanAnalysisService, private gasDensityFormService: GasDensityFormService,
    private planeDataFormService: PlaneDataFormService, private fanShaftPowerFormService: FanShaftPowerFormService, private fanInfoFormService: FanInfoFormService,
    private fsatService: FsatService) { }

  ngOnInit() {
    this.getResultsSub = this.fanAnalysisService.getResults.subscribe(val => {
      this.calculateResults();
    })
  }

  ngOnDestroy() {
    this.getResultsSub.unsubscribe();
  }

  calculateResults() {
    let planeDataDone: boolean = this.planeDataFormService.checkPlaneDataValid(this.fanAnalysisService.inputData.PlaneData, this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
    let basicsDone: boolean = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings).valid;
    let gasDone: boolean = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings).valid;
    let shaftPowerDone: boolean = this.fanShaftPowerFormService.getShaftPowerFormFromObj(this.fanAnalysisService.inputData.FanShaftPower).valid;

    if (planeDataDone && basicsDone && gasDone && shaftPowerDone) {
      this.results = this.fsatService.fan203(this.fanAnalysisService.inputData, this.settings);
      this.fanAnalysisService.fanShaftPowerResults.next(
        {
          power: this.results.power,
          powerCorrected: this.results.powerCorrected
        });
    }
  }
}
