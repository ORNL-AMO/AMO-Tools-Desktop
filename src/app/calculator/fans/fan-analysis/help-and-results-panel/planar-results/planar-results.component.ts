import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { FanAnalysisService } from '../../fan-analysis.service';
import { Subscription } from 'rxjs';
import { PlaneResults, Fan203Inputs } from '../../../../../shared/models/fans';
import { PlaneDataFormService } from '../../fan-analysis-form/plane-data-form/plane-data-form.service';

@Component({
    selector: 'app-planar-results',
    templateUrl: './planar-results.component.html',
    styleUrls: ['./planar-results.component.css'],
    standalone: false
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
  inAssessmentModal: boolean;
  pressureCalcResultType: string = 'static';
  constructor(private fanAnalysisService: FanAnalysisService, private planeDataFormService: PlaneDataFormService) { }

  ngOnInit() {
    this.inAssessmentModal = this.fanAnalysisService.inAssessmentModal;
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
    this.planeResults = this.fanAnalysisService.getPlaneResults(this.settings);
  }

  setPressureCalcType(str: string){
    this.fanAnalysisService.pressureCalcResultType = str;
    this.fanAnalysisService.getResults.next(true);
  }
}
