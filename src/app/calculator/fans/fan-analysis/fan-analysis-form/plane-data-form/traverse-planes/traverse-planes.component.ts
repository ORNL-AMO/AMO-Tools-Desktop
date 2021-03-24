import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Plane, PlaneResults, VelocityResults } from '../../../../../../shared/models/fans';
import { Settings } from '../../../../../../shared/models/settings';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { PlaneDataFormService } from '../plane-data-form.service';

@Component({
  selector: 'app-traverse-planes',
  templateUrl: './traverse-planes.component.html',
  styleUrls: ['./traverse-planes.component.css']
})
export class TraversePlanesComponent implements OnInit {

  @Input()
  planeStep: string;
  @Input()
  settings: Settings;

  velocityResultsSub: Subscription;
  velocityResults: VelocityResults;
  planeDescription: string;
  userDefinedStaticPressure: boolean = true;
  fanDataForm: FormGroup;
  planeData: Plane;
  planeNumber: string;
  planeResults: PlaneResults;
  getResultsSub: Subscription;

  constructor(private fanAnalysisService: FanAnalysisService,
              private cd: ChangeDetectorRef,
             private planeDataFormService: PlaneDataFormService) { }

  ngOnInit(): void {
    this.setPlane();
    this.initForm();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.velocityResultsSub.unsubscribe();
    this.getResultsSub.unsubscribe();
  }

  initSubscriptions() {
    this.velocityResultsSub = this.fanAnalysisService.velocityResults.subscribe(results => {
      this.velocityResults = results;
    });
    this.getResultsSub = this.fanAnalysisService.getResults.subscribe(updatedResults => {
      if (updatedResults) {
        this.initForm();
        this.setPlaneTraverseVelocity();
      }
    });
  }

  save() {
    if (this.userDefinedStaticPressure) {
      this.planeDataFormService.staticPressureValue.next(this.fanDataForm.controls.userDefinedStaticPressure.value);
    } 
  }

  initForm() {
    let planeData = this.fanAnalysisService.getPlane(this.planeStep);
    this.fanDataForm = this.planeDataFormService.getPlaneFormFromObj(planeData, this.settings, this.planeNumber);
    this.cd.detectChanges();
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  showHideInputField() {
    this.userDefinedStaticPressure = !this.userDefinedStaticPressure;
    this.save();
  }

  setPlaneTraverseVelocity() {
    this.planeResults = this.fanAnalysisService.getPlaneResults(this.settings);
    debugger;
    if (this.planeResults && this.velocityResults) {
      this.velocityResults.traverseVelocity = this.planeResults.FlowTraverse.gasVelocity;
      if (this.planeStep == '3b') {
        this.velocityResults.traverseVelocity = this.planeResults.AddlTraversePlanes[0].gasVelocity;
      } else if (this.planeStep == '3c') {
        this.velocityResults.traverseVelocity = this.planeResults.AddlTraversePlanes[1].gasVelocity;
      }
      console.log(this.velocityResults.traverseVelocity);
    }

  }

  setPlane() {
    this.planeNumber = '1';
    if (this.planeStep == '3b') {
      this.planeNumber = '2';
    } else if (this.planeStep == '3c') {
      this.planeNumber = '3';
    }
    this.planeDescription = `Additional Traverse Plane ${this.planeNumber}`;
  }

}
