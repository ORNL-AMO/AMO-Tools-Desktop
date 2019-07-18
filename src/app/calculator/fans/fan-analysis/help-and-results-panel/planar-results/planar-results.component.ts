import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { FsatService } from '../../../../../fsat/fsat.service';
import { FanAnalysisService } from '../../fan-analysis.service';
import { Subscription } from 'rxjs';
import { PlaneResults, Fan203Inputs } from '../../../../../shared/models/fans';
import { GasDensityFormService } from '../../fan-analysis-form/gas-density-form/gas-density-form.service';
import { PlaneDataFormService } from '../../fan-analysis-form/plane-data-form/plane-data-form.service';
import { ConvertFanAnalysisService } from '../../convert-fan-analysis.service';

@Component({
  selector: 'app-planar-results',
  templateUrl: './planar-results.component.html',
  styleUrls: ['./planar-results.component.css']
})
export class PlanarResultsComponent implements OnInit {
  // @Input()
  // showFull: boolean;
  @Input()
  pressureCalcType: string;
  @Input()
  settings: Settings;

  getResultsSubscription: Subscription;
  planeResults: PlaneResults;
  inputs: Fan203Inputs;
  stepTabSubscription: Subscription;
  stepTab: string;
  planeStepSubscription: Subscription;
  planeStep: string;
  showFull: boolean = false;
  constructor(private convertFanAnalysisService: ConvertFanAnalysisService, private fanAnalysisService: FanAnalysisService, private gasDensityFormService: GasDensityFormService, private planeDataFormService: PlaneDataFormService) { }

  ngOnInit() {
    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.getResults();
    })
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
    this.planeStepSubscription = this.planeDataFormService.planeStep.subscribe(val => {
      this.planeStep = val;
    })
  }

  ngOnDestroy() {
    this.getResultsSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.planeStepSubscription.unsubscribe();
  }

  getResults() {
    this.inputs = this.fanAnalysisService.inputData;
    let gasDone: boolean = this.gasDensityFormService.getGasDensityFormFromObj(this.fanAnalysisService.inputData.BaseGasDensity, this.settings).valid;
    let planeDataDone: boolean = this.planeDataFormService.checkPlaneDataValid(this.fanAnalysisService.inputData.PlaneData, this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
    if (gasDone && planeDataDone) {
      this.planeResults = this.convertFanAnalysisService.getPlaneResults(this.fanAnalysisService.inputData, this.settings);
    } else {
      this.planeResults;
    }
  }

}
