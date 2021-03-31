import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges } from '@angular/core';
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
  fanDataForm: FormGroup;
  planeData: Plane;
  planeNumber: string;
  planeResults: PlaneResults;
  getResultsSub: Subscription;

  showUserPressurePlaneA: boolean = true;
  showUserPressurePlaneB: boolean = true;
  showUserPressurePlaneC: boolean = true;


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

  
  ngOnChanges(changes: SimpleChanges) {
    if (changes.planeStep && !changes.planeStep.firstChange) {
      this.planeDataFormService.staticPressureValue.next(undefined);
    }
  }

  initSubscriptions() {
    this.velocityResultsSub = this.fanAnalysisService.velocityResults.subscribe(results => {
      this.velocityResults = results;
      this.setPlaneTraverseVelocity();
    });
    this.getResultsSub = this.fanAnalysisService.getResults.subscribe(updatedResults => {
      if (updatedResults) {
        this.initForm();
      }
    });
  }

  setUserDefinedStaticPressure() {
    let hasDefinedStaticPressure = (this.showUserPressurePlaneA && this.planeStep == '3a') || (this.showUserPressurePlaneB && this.planeStep == '3b') || (this.showUserPressurePlaneC && this.planeStep == '3c');
    if (hasDefinedStaticPressure) {
      this.planeDataFormService.staticPressureValue.next(this.fanDataForm.controls.userDefinedStaticPressure.value);
    } 
  }

  initForm() {
    let planeData = this.fanAnalysisService.getPlane(this.planeStep);
    this.fanDataForm = this.planeDataFormService.getPlaneFormFromObj(planeData, this.settings, this.planeStep);
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  toggleStaticPressureInputType(planeStep: string) {
    switch(planeStep) {
      case 'a':
        this.showUserPressurePlaneA = !this.showUserPressurePlaneA;
        break;
      case 'b':
        this.showUserPressurePlaneB = !this.showUserPressurePlaneB;
        break;
      case 'c':
        this.showUserPressurePlaneC = !this.showUserPressurePlaneC;
        break;
    }
    this.cd.detectChanges();
    this.setUserDefinedStaticPressure();
  }

  setPlaneTraverseVelocity() {
    this.planeResults = this.fanAnalysisService.getPlaneResults(this.settings);
    if (this.planeResults && !this.planeResults.error && this.velocityResults) {
      if (this.planeStep == '3a') {
        this.velocityResults.traverseVelocity = this.planeResults.FlowTraverse.gasVelocity;
      } else if (this.planeStep == '3b') {
        this.velocityResults.traverseVelocity = this.planeResults.AddlTraversePlanes[0].gasVelocity;
      } else if (this.planeStep == '3c') {
        this.velocityResults.traverseVelocity = this.planeResults.AddlTraversePlanes[1].gasVelocity;
      }
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
