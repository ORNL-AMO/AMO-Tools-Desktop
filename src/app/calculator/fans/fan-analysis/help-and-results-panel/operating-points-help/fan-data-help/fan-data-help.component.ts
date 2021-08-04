import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { PlaneDataFormService } from '../../../fan-analysis-form/plane-data-form/plane-data-form.service';

@Component({
  selector: 'app-fan-data-help',
  templateUrl: './fan-data-help.component.html',
  styleUrls: ['./fan-data-help.component.css']
})
export class FanDataHelpComponent implements OnInit {

  currentField: string;
  currentFieldSubscription: Subscription;

  planeType: string;
  planeStepSubscription: Subscription;
  planeStep: string;

  getResultsSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService, private planeDataFormService: PlaneDataFormService) { }

  ngOnInit() {
    this.currentFieldSubscription = this.fanAnalysisService.currentField.subscribe(val => {
      this.currentField = val;
    });

    this.planeStepSubscription = this.planeDataFormService.planeStep.subscribe(val => {
      this.planeStep = val;
      this.setPlaneType();
    });

    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.setPlaneType();
    });
  }

  ngOnDestroy() {
    this.currentFieldSubscription.unsubscribe();
    this.planeStepSubscription.unsubscribe();
    this.getResultsSubscription.unsubscribe();
  }


  setPlaneType() {
    if (this.planeStep == '1') {
      this.planeType = this.fanAnalysisService.inputData.PlaneData.FanInletFlange.planeType;
    } else if (this.planeStep == '2') {
      this.planeType = this.fanAnalysisService.inputData.PlaneData.FanEvaseOrOutletFlange.planeType;
    } else if (this.planeStep == '3a') {
      this.planeType = this.fanAnalysisService.inputData.PlaneData.FlowTraverse.planeType;
    } else if (this.planeStep == '3b') {
      this.planeType = this.fanAnalysisService.inputData.PlaneData.AddlTraversePlanes[0].planeType;
    } else if (this.planeStep == '3c') {
      this.planeType = this.fanAnalysisService.inputData.PlaneData.AddlTraversePlanes[1].planeType;
    } else if (this.planeStep == '4') {
      this.planeType = this.fanAnalysisService.inputData.PlaneData.InletMstPlane.planeType;
    } else if (this.planeStep == '5') {
      this.planeType = this.fanAnalysisService.inputData.PlaneData.OutletMstPlane.planeType;
    }
  }
}
