import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WaterTreatment } from '../../shared/models/water-assessment';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { WaterTreatmentService } from './water-treatment.service';
import { WaterAssessmentService } from '../water-assessment.service';
import { copyObject } from '../../shared/helperFunctions';
import { waterTreatmentTypeOptions } from '../waterConstants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-water-treatment',
  templateUrl: './water-treatment.component.html',
  styleUrl: './water-treatment.component.css'
})
export class WaterTreatmentComponent {
  @Input()
  waterTreatment: WaterTreatment;
  @Output()
  updateWaterTreatment: EventEmitter<WaterTreatment> = new EventEmitter<WaterTreatment>();
  @Input()
  inSystemBasics: boolean;
  form: FormGroup;

  settings: Settings;
  waterTreatmentOptions: {value: number, display: string}[];
  formWidth: number;
  showOperatingHoursModal: boolean = false;
  waterAssessmentSub: Subscription;

  constructor(
    private waterAssessmentService: WaterAssessmentService,
    private waterTreatmentService: WaterTreatmentService
  ) { }

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.waterAssessmentSub = this.waterAssessmentService.waterAssessment.subscribe(waterAssessment => {
      this.waterTreatmentOptions = this.waterAssessmentService.getAvailableTreatmentOptions(waterAssessment.waterTreatments, copyObject(waterTreatmentTypeOptions));
    });

    this.initForm();
  }

  initForm() {
    debugger;
    this.form = this.waterTreatmentService.getFormFromObj(this.waterTreatment);
    if (!this.inSystemBasics) {
      this.form.controls.treatmentType.disable();
      this.form.controls.cost.disable();
    } 
   }

  ngOnDestroy() {
    this.waterAssessmentSub.unsubscribe();
  }

  save() {
    let updatedWaterTreatment: WaterTreatment = this.waterTreatmentService.getWaterTreatmentFromForm(this.form, this.waterTreatment);
    this.updateWaterTreatment.emit(updatedWaterTreatment);
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }
  


}
