import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
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
  @Input()
  inModal: boolean;

  ratedInfoForm: UntypedFormGroup;

  planes: Array<number> = [
    1, 2, 3
  ];
  resetFormSubscription: Subscription;
  constructor(private fanInfoFormService: FanInfoFormService, private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.ratedInfoForm = this.fanInfoFormService.getBasicsFormFromObject(this.fanAnalysisService.inputData.FanRatedInfo, this.settings);
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.resetData();
      }
    });
    if (this.fanAnalysisService.inAssessmentModal) {
      this.updateBarometricPressure();
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

  updateBarometricPressure() {
    if (this.fanAnalysisService.inputData.PlaneData.variationInBarometricPressure == false) {
      this.fanAnalysisService.inputData.FanRatedInfo = this.fanInfoFormService.getBasicsObjectFromForm(this.ratedInfoForm);
      this.fanAnalysisService.updateBarometricPressure();
    }
    this.save();
  }

  save() {
    this.fanAnalysisService.inputData.FanRatedInfo = this.fanInfoFormService.getBasicsObjectFromForm(this.ratedInfoForm);
    this.fanAnalysisService.getResults.next(true);
  }
}
