import { Component, EventEmitter, Input, Output,  } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { WaterAssessmentService } from '../water-assessment.service';
import { Subscription } from 'rxjs';
import { WaterAssessment, WaterTreatment, waterTreatmentTypeOptions, WaterUsingSystem } from 'process-flow-lib';
import { WaterSystemComponentService } from '../water-system-component.service';
import { copyObject } from '../../shared/helperFunctions';

@Component({
  selector: 'app-water-treatment',
  templateUrl: './water-treatment.component.html',
  styleUrl: './water-treatment.component.css'
})
export class WaterTreatmentComponent {
  @Input()
  waterSystem: WaterUsingSystem;
  @Output()
  emitInSystemUpdate = new EventEmitter<WaterUsingSystem>();

  settings: Settings;
  waterTreatmentOptions: { value: number, display: string }[];
  formWidth: number;
  showOperatingHoursModal: boolean = false;
  waterAssessmentSub: Subscription;
  form: FormGroup;
  settingsSub: Subscription;
  componentFormTitle: string;

  selectedComponentSub: Subscription;
  waterAssessment: WaterAssessment;
  selectedWaterTreatment: WaterTreatment;
  idString: string;

  constructor(
    private waterAssessmentService: WaterAssessmentService,
    private waterSystemComponentService: WaterSystemComponentService,
  ) { }

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('water-treatment');
    this.waterTreatmentOptions = copyObject(waterTreatmentTypeOptions);
        
    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
        this.selectedWaterTreatment = selectedComponent as WaterTreatment;
        this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
        let waterTreatments = this.getWaterTreatments();
        this.waterSystemComponentService.selectedViewComponents.next(waterTreatments);
        if (this.selectedWaterTreatment) {
          this.idString = this.componentFormTitle + this.selectedWaterTreatment.diagramNodeId;
          this.initForm();
        }
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    this.waterSystemComponentService.setDefaultSelectedComponent(this.getWaterTreatments(), this.selectedWaterTreatment, 'water-treatment')
  }

  initForm() {
    this.form = this.waterSystemComponentService.getWaterTreatmentFormFromObj(this.selectedWaterTreatment);
  }

  getWaterTreatments(): WaterTreatment[] {
    if (this.waterSystem) {
      return this.waterSystem.inSystemTreatment;
    }
    return this.waterAssessment.waterTreatments;
  }

  updateWaterTreatments(updated: WaterTreatment) {
    if (this.waterSystem) {
      let updateIndex: number = this.waterSystem.inSystemTreatment.findIndex(treatment => treatment.diagramNodeId === updated.diagramNodeId);
      this.waterSystem.inSystemTreatment[updateIndex] = updated;
      this.emitInSystemUpdate.emit(this.waterSystem);
    } else { 
      let updateIndex: number = this.waterAssessment.waterTreatments.findIndex(treatment => treatment.diagramNodeId === updated.diagramNodeId);
      this.waterAssessment.waterTreatments[updateIndex] = updated;
      this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
    }
  }

  save(updated?: WaterTreatment) {
    if (!updated) {
      updated = this.waterSystemComponentService.getWaterTreatmentFromForm(this.form, this.selectedWaterTreatment);
    }
    this.updateWaterTreatments(updated);
  }


  addWaterTreatment() {
    this.waterAssessmentService.addNewWaterComponent('water-treatment')
  }



  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

}
