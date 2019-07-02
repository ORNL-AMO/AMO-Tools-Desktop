import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlaneDataFormService } from './plane-data-form.service';
import { PlaneData, FanRatedInfo } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { FanAnalysisService } from '../../fan-analysis.service';

@Component({
  selector: 'app-plane-data-form',
  templateUrl: './plane-data-form.component.html',
  styleUrls: ['./plane-data-form.component.css']
})
export class PlaneDataFormComponent implements OnInit {
  @Input()
  settings: Settings;

  planeStep: string;
  planeStepSubscription: Subscription;
  numTraversePlanes: number;
  constructor(private planeDataFormService: PlaneDataFormService, private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.planeStepSubscription = this.planeDataFormService.planeStep.subscribe(val => {
      this.planeStep = val;
    })
    this.numTraversePlanes = this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes;
  }

  ngOnDestroy() {
    this.planeStepSubscription.unsubscribe();
  }

  changePlaneStepTab(str: string) {
    this.planeDataFormService.planeStep.next(str);
  }
}
