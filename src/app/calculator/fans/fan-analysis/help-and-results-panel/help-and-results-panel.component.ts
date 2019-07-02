import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Fan203Inputs, FanRatedInfo } from '../../../../shared/models/fans';
import { FanAnalysisService } from '../fan-analysis.service';
import { Subscription } from 'rxjs';
import { PlaneDataFormService } from '../fan-analysis-form/plane-data-form/plane-data-form.service';

@Component({
  selector: 'app-help-and-results-panel',
  templateUrl: './help-and-results-panel.component.html',
  styleUrls: ['./help-and-results-panel.component.css']
})
export class HelpAndResultsPanelComponent implements OnInit {
  @Input()
  settings: Settings;
  // @Input()
  // inputs: Fan203Inputs;

  tabSelect: string = 'results';
  fanRatedInfo: FanRatedInfo;
  getResultsSubscription: Subscription;
  planeStepSubscription: Subscription;
  planeStep: string;
  constructor(private fanAnalysisService: FanAnalysisService, private planeDataFormService: PlaneDataFormService) { }

  ngOnInit() {
    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.fanRatedInfo = this.fanAnalysisService.inputData.FanRatedInfo;
    });
    this.planeStepSubscription = this.planeDataFormService.planeStep.subscribe(val => {
      this.planeStep = val;
    })
  }

  ngOnDestroy(){
    this.getResultsSubscription.unsubscribe();
    this.planeStepSubscription.unsubscribe();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

}
