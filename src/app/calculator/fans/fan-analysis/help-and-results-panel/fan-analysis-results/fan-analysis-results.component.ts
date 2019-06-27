import { Component, OnInit, Input } from '@angular/core';
import { Fan203Results, Fan203Inputs } from '../../../../../shared/models/fans';
import { FanAnalysisService } from '../../fan-analysis.service';
import { FsatService } from '../../../../../fsat/fsat.service';
import { Settings } from '../../../../../shared/models/settings';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-analysis-results',
  templateUrl: './fan-analysis-results.component.html',
  styleUrls: ['./fan-analysis-results.component.css']
})
export class FanAnalysisResultsComponent implements OnInit {
  @Input()
  settings: Settings
  @Input()
  inputs: Fan203Inputs;

  tabSelect: string = 'results';
  results: Fan203Results;

  getResultsSub: Subscription;

  constructor(private fanAnalysisService: FanAnalysisService, private fsatService: FsatService) { }

  ngOnInit() {
    this.getResultsSub = this.fanAnalysisService.getResults.subscribe(val => {
      this.calculateResults();
    })
  }

  ngOnDestroy(){
    this.getResultsSub.unsubscribe();
  }

  calculateResults() {
    let planeDataDone: boolean;
    let basicsDone: boolean;
    let gasDone: boolean;
    let shaftPowerDone: boolean;


    if (planeDataDone && basicsDone && gasDone && shaftPowerDone) {
      // this.planeResults = this.fsatService.getPlaneResults(this.inputs, this.settings);
      this.results = this.fsatService.fan203(this.inputs, this.settings);
    } else {
      this.results = {
        fanEfficiencyTotalPressure: 0,
        fanEfficiencyStaticPressure: 0,
        fanEfficiencyStaticPressureRise: 0,
        flowCorrected: 0,
        pressureTotalCorrected: 0,
        pressureStaticCorrected: 0,
        staticPressureRiseCorrected: 0,
        powerCorrected: 0,
        kpc: 0
      };
    }
  }
}
