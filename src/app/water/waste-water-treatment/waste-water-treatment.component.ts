import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { WasteWaterTreatment, WaterAssessment } from '../../shared/models/water-assessment';
import { FormGroup } from '@angular/forms';
import { WaterAssessmentService } from '../water-assessment.service';
import { WaterSystemComponentService } from '../water-system-component.service';
import { Subscription } from 'rxjs';
import { copyObject } from '../../shared/helperFunctions';
import { wasteWaterTreatmentTypeOptions } from '../../../process-flow-types/shared-process-flow-constants';
import { WasteWaterTreatmentService } from './waste-water-treatment.service';

@Component({
  selector: 'app-waste-water-treatment',
  templateUrl: './waste-water-treatment.component.html',
  styleUrl: './waste-water-treatment.component.css'
})
export class WasteWaterTreatmentComponent {
  @Input()
  wasteWaterTreatment: WasteWaterTreatment;
  @Output()
  updateWaterTreatment: EventEmitter<WasteWaterTreatment> = new EventEmitter<WasteWaterTreatment>();
  @Input()
  inSystemBasics: boolean;

  form: FormGroup;

  settings: Settings;
  wasteWaterTreatmentOptions: {value: number, display: string}[];
  formWidth: number;
  waterAssessmentSub: Subscription;
  waterAssessment: WaterAssessment;
  selectedWasteWaterTreatment: WasteWaterTreatment;
  selectedComponentSub: Subscription;
  settingsSub: Subscription;

  constructor(
    private waterAssessmentService: WaterAssessmentService,
    private waterSystemComponentService: WaterSystemComponentService,
    private wasteTreatmentService: WasteWaterTreatmentService
  ) { }

  ngOnInit() {
    this.settingsSub = this.waterAssessmentService.settings.subscribe(settings => {
      this.settings = settings;
    });

    this.waterAssessmentSub = this.waterAssessmentService.waterAssessment.subscribe(waterAssessment => {
      this.wasteWaterTreatmentOptions = this.waterAssessmentService.getAvailableTreatmentOptions(waterAssessment.wasteWaterTreatments, copyObject(wasteWaterTreatmentTypeOptions));
    });

    // * 6927 component table will be hidden for this component
    // this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
    //   this.selectedWasteWaterTreatment = selectedComponent as WasteWaterTreatment;
    //   this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    //   this.waterSystemComponentService.selectedViewComponents.next(this.waterAssessment.wasteWaterTreatments);
    //   if (this.selectedWasteWaterTreatment) {
    //     // this.initForm();
    //   }
    // });

    // this.setDefaultSelectedComponent();
    this.initForm();
  }

  ngOnDestroy() {
    this.waterAssessmentSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }
  //   setDefaultSelectedComponent() {
  //   this.waterSystemComponentService.setDefaultSelectedComponent(this.waterAssessment.wasteWaterTreatments, this.selectedWasteWaterTreatment, 'waste-water-treatment')
  // }

  setWasteWaterTreatmentType() {
    this.save();
  }

  initForm() {
    this.form = this.wasteTreatmentService.getFormFromObj(this.wasteWaterTreatment);
    if (!this.inSystemBasics) {
      this.form.controls.treatmentType.disable();
      this.form.controls.cost.disable();
    } 
   }


  save() {
    let updatedWasteWaterTreatment: WasteWaterTreatment = this.wasteTreatmentService.getWasteWaterTreatmentFromForm(this.form, this.wasteWaterTreatment);
    this.updateWaterTreatment.emit(updatedWasteWaterTreatment);
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }
  


}