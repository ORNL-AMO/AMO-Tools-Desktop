import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../../../shared/convert-units/convert-units.service';
import { Plane, VelocityResults } from '../../../../../../shared/models/fans';
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
  getResultsSub: Subscription;

  constructor(private fanAnalysisService: FanAnalysisService,
             private convertUnitsService: ConvertUnitsService,
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
      }
    });
  }

  save() {
    if (this.userDefinedStaticPressure) {
      this.planeDataFormService.staticPressureValue.next(this.fanDataForm.controls.staticPressure.value);
    }
  }

  initForm() {
    let planeData = this.fanAnalysisService.getPlane(this.planeStep);
    this.fanDataForm = this.planeDataFormService.getPlaneFormFromObj(planeData, this.settings, this.planeNumber);
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  showHideInputField() {
    this.userDefinedStaticPressure = !this.userDefinedStaticPressure;
    this.save();
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
