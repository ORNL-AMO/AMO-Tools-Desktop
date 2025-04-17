import { Component, OnInit } from '@angular/core';
import { FanRatedInfo } from '../../../../../shared/models/fans';
import { Subscription } from 'rxjs';
import { FanAnalysisService } from '../../fan-analysis.service';
import { PlaneDataFormService } from '../../fan-analysis-form/plane-data-form/plane-data-form.service';

@Component({
    selector: 'app-fan-diagram-image',
    templateUrl: './fan-diagram-image.component.html',
    styleUrls: ['./fan-diagram-image.component.css'],
    standalone: false
})
export class FanDiagramImageComponent implements OnInit {
  fanRatedInfo: FanRatedInfo;
  getResultsSubscription: Subscription;
  planeStepSubscription: Subscription;
  planeStep: string;
  stepTabSubscription: Subscription;
  stepTab: string;
  constructor(private fanAnalysisService: FanAnalysisService, private planeDataFormService: PlaneDataFormService) { }

  ngOnInit() {
    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.fanRatedInfo = this.fanAnalysisService.inputData.FanRatedInfo;
    });
    this.planeStepSubscription = this.planeDataFormService.planeStep.subscribe(val => {
      this.planeStep = val;
    })
    this.stepTabSubscription = this.fanAnalysisService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
  }
  ngOnDestroy(){
    this.getResultsSubscription.unsubscribe();
    this.planeStepSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
  }

}
