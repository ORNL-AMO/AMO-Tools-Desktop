import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
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
  getResultsSubscription: Subscription;
  numTraversePlanes: number;
  infoClassStatus: Array<string> = [];
  stepOneClassStatus: Array<string> = [];
  stepTwoClassStatus: Array<string> = [];
  stepThreeAClassStatus: Array<string> = [];
  stepThreeBClassStatus: Array<string> = [];
  stepThreeCClassStatus: Array<string> = [];
  stepFourClassStatus: Array<string> = [];
  stepFiveClassStatus: Array<string> = [];
  constructor(private planeDataFormService: PlaneDataFormService, private fanAnalysisService: FanAnalysisService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.planeStepSubscription = this.planeDataFormService.planeStep.subscribe(val => {
      this.planeStep = val;
      this.checkClasses();
      this.cd.detectChanges();
    });
    this.getResultsSubscription = this.fanAnalysisService.getResults.subscribe(val => {
      this.numTraversePlanes = this.fanAnalysisService.inputData.FanRatedInfo.traversePlanes;
      this.checkClasses();
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.planeStepSubscription.unsubscribe();
    this.getResultsSubscription.unsubscribe();
    this.planeDataFormService.planeStep.next('plane-info');
  }

  changePlaneStepTab(str: string) {
    this.planeDataFormService.planeStep.next(str);
  }

  checkClasses() {
    this.checkInfoClass();
    this.checkStepOne();
    this.checkStepTwo();
    this.checkStepThreeA();
    if (this.numTraversePlanes > 1) {
      this.checkStepThreeB();
      if (this.numTraversePlanes == 3) {
        this.checkStepThreeC();
      }
    }
    this.checkStepFour();
    this.checkStepFive();
  }

  checkInfoClass() {
    let planeInfoDone: boolean = this.planeDataFormService.getPlaneInfoFormFromObj(this.fanAnalysisService.inputData.PlaneData).valid;
    if (!planeInfoDone) {
      this.infoClassStatus = ['missing-data'];
    } else {
      this.infoClassStatus = [];
    }
    if (this.planeStep === 'plane-info') {
      this.infoClassStatus.push('active');
    }
  }

  checkStepOne() {
    let stepOneDone: boolean = this.planeDataFormService.getPlaneFormFromObj(this.fanAnalysisService.inputData.PlaneData.FanInletFlange, this.settings, '1').valid;
    if (!stepOneDone) {
      this.stepOneClassStatus = ['missing-data'];
    } else {
      this.stepOneClassStatus = [];
    }
    if (this.planeStep === '1') {
      this.stepOneClassStatus.push('active');
    }
  }

  checkStepTwo() {
    let stepTwoDone: boolean = this.planeDataFormService.getPlaneFormFromObj(this.fanAnalysisService.inputData.PlaneData.FanEvaseOrOutletFlange, this.settings, '2').valid;
    if (!stepTwoDone) {
      this.stepTwoClassStatus = ['missing-data'];
    } else {
      this.stepTwoClassStatus = [];
    }
    if (this.planeStep === '2') {
      this.stepTwoClassStatus.push('active');
    }
  }

  checkStepThreeA() {
    let stepThreeADone: boolean = this.planeDataFormService.getPlaneFormFromObj(this.fanAnalysisService.inputData.PlaneData.FlowTraverse, this.settings, '3a').valid;
    if (!stepThreeADone) {
      this.stepThreeAClassStatus = ['missing-data'];
    } else {
      this.stepThreeAClassStatus = [];
    }
    if (this.planeStep === '3a') {
      this.stepThreeAClassStatus.push('active');
    }
  }

  checkStepThreeB() {
    let stepThreeBDone: boolean = this.planeDataFormService.getPlaneFormFromObj(this.fanAnalysisService.inputData.PlaneData.AddlTraversePlanes[0], this.settings, '3b').valid;
    if (!stepThreeBDone) {
      this.stepThreeBClassStatus = ['missing-data'];
    } else {
      this.stepThreeBClassStatus = [];
    }
    if (this.planeStep === '3b') {
      this.stepThreeBClassStatus.push('active');
    }
  }

  checkStepThreeC() {
    let stepThreeCDone: boolean = this.planeDataFormService.getPlaneFormFromObj(this.fanAnalysisService.inputData.PlaneData.AddlTraversePlanes[1], this.settings, '3c').valid;
    if (!stepThreeCDone) {
      this.stepThreeCClassStatus = ['missing-data'];
    } else {
      this.stepThreeCClassStatus = [];
    }
    if (this.planeStep === '3c') {
      this.stepThreeCClassStatus.push('active');
    }
  }

  checkStepFour() {
    let stepFourDone: boolean = this.planeDataFormService.getPlaneFormFromObj(this.fanAnalysisService.inputData.PlaneData.InletMstPlane, this.settings, '4').valid;
    if (!stepFourDone) {
      this.stepFourClassStatus = ['missing-data'];
    } else {
      this.stepFourClassStatus = [];
    }
    if (this.planeStep === '4') {
      this.stepFourClassStatus.push('active');
    }
  }

  checkStepFive() {
    let stepOneDone: boolean = this.planeDataFormService.getPlaneFormFromObj(this.fanAnalysisService.inputData.PlaneData.OutletMstPlane, this.settings, '5').valid;
    if (!stepOneDone) {
      this.stepFiveClassStatus = ['missing-data'];
    } else {
      this.stepFiveClassStatus = [];
    }
    if (this.planeStep === '5') {
      this.stepFiveClassStatus.push('active');
    }
  }
}
