import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { WaterAssessmentService } from '../water-assessment.service';
import { WaterSystemComponentService } from '../water-system-component.service';
import { Subscription } from 'rxjs';
import { WasteWaterTreatment, wasteWaterTreatmentTypeOptions, WaterAssessment, } from 'process-flow-lib';
import { copyObject } from '../../shared/helperFunctions';

@Component({
  selector: 'app-waste-water-treatment',
  standalone: false,
  templateUrl: './waste-water-treatment.component.html',
  styleUrl: './waste-water-treatment.component.css'
})
export class WasteWaterTreatmentComponent {
  settings: Settings;
  wasteWaterTreatmentOptions: { value: number, display: string }[];
  formWidth: number;
  showOperatingHoursModal: boolean = false;
  form: FormGroup;
  settingsSub: Subscription;
  componentFormTitle: string;

  selectedComponentSub: Subscription;
  waterAssessment: WaterAssessment;
  selectedWasteWaterTreatment: WasteWaterTreatment;
  idString: string;

  constructor(
    private waterAssessmentService: WaterAssessmentService,
    private waterSystemComponentService: WaterSystemComponentService,
  ) { }

  ngOnInit() {
    this.settingsSub = this.waterAssessmentService.settings.subscribe(settings => {
      this.settings = settings;
    });
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('waste-water-treatment');
    this.wasteWaterTreatmentOptions = copyObject(wasteWaterTreatmentTypeOptions);

    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedWasteWaterTreatment = selectedComponent as WasteWaterTreatment;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterSystemComponentService.selectedViewComponents.next(this.waterAssessment.wasteWaterTreatments);
      if (this.selectedWasteWaterTreatment) {
        this.initForm();
      }
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.settingsSub.unsubscribe();
  }

  initForm() {
    this.form = this.waterSystemComponentService.getWasteWaterFormFromObj(this.selectedWasteWaterTreatment);
  }

  save(updated?: WasteWaterTreatment) {
    if (!updated) {
      updated = this.waterSystemComponentService.getWaterTreatmentFromForm(this.form, this.selectedWasteWaterTreatment);
    }
    let updateIndex: number = this.waterAssessment.wasteWaterTreatments.findIndex(treatment => treatment.diagramNodeId === updated.diagramNodeId);
    this.waterAssessment.wasteWaterTreatments[updateIndex] = updated;
    this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
  }


  addWasteWaterTreatments() {
    this.waterAssessmentService.addNewWaterComponent('waste-water-treatment')
  }

  setDefaultSelectedComponent() {
    this.waterSystemComponentService.setDefaultSelectedComponent(this.waterAssessment.wasteWaterTreatments, this.selectedWasteWaterTreatment, 'waste-water-treatment')
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }



}
