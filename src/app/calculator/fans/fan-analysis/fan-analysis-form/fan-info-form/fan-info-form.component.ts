import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { FanInfoFormService } from './fan-info-form.service';
import { FanAnalysisService } from '../../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-info-form',
  templateUrl: './fan-info-form.component.html',
  styleUrls: ['./fan-info-form.component.css']
})
export class FanInfoFormComponent implements OnInit {
  @Input()
  settings: Settings;

  ratedInfoForm: FormGroup;

  planes: Array<number> = [
    1, 2, 3
  ];
  resetFormSubscription: Subscription;
  constructor(private fanInfoFormService: FanInfoFormService, private convertUnitsService: ConvertUnitsService, private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.ratedInfoForm = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.resetData();
      }
    });
    if (this.fanAnalysisService.inAssessmentModal) {
      this.ratedInfoForm.controls.fanSpeed.disable();
      this.ratedInfoForm.controls.motorSpeed.disable();
      this.ratedInfoForm.controls.globalBarometricPressure.disable();
    }
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
  }

  resetData() {
    this.ratedInfoForm = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
  }

  focusField(str: string) {
    this.fanAnalysisService.currentField.next(str);
  }

  updatePressure() {
    this.fanAnalysisService.inputData.FanRatedInfo = this.fanInfoFormService.getBasicsObjectFromForm(this.ratedInfoForm);
    this.fanAnalysisService.inputData.PlaneData.FanInletFlange.barometricPressure = this.fanAnalysisService.inputData.FanRatedInfo.globalBarometricPressure;
    this.fanAnalysisService.inputData.PlaneData.FanEvaseOrOutletFlange.barometricPressure = this.fanAnalysisService.inputData.FanRatedInfo.globalBarometricPressure;
    this.fanAnalysisService.inputData.PlaneData.FlowTraverse.barometricPressure = this.fanAnalysisService.inputData.FanRatedInfo.globalBarometricPressure;
    this.fanAnalysisService.inputData.PlaneData.AddlTraversePlanes.forEach(plane => {
      plane.barometricPressure = this.fanAnalysisService.inputData.FanRatedInfo.globalBarometricPressure;
    });
    this.fanAnalysisService.inputData.PlaneData.InletMstPlane.barometricPressure = this.fanAnalysisService.inputData.FanRatedInfo.globalBarometricPressure;
    this.fanAnalysisService.inputData.PlaneData.OutletMstPlane.barometricPressure = this.fanAnalysisService.inputData.FanRatedInfo.globalBarometricPressure;
    this.fanAnalysisService.getResults.next(true);
  }
  save() {
    this.fanAnalysisService.inputData.FanRatedInfo = this.fanInfoFormService.getBasicsObjectFromForm(this.ratedInfoForm);
    this.fanAnalysisService.getResults.next(true);
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }
}
