import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import _ from 'lodash';
import { WaterUsingSystem, WaterAssessment, WaterTreatment, getNewWaterTreatmentComponent, inSystemTreatmentTypeOptions } from 'process-flow-lib';
import { Subscription } from 'rxjs';
import { copyObject } from '../../../shared/helperFunctions';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WaterSystemComponentService } from '../../water-system-component.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-system-treatment',
  standalone: false,
  templateUrl: './system-treatment.component.html',
  styleUrl: './system-treatment.component.css'
})
export class SystemTreatmentComponent {
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

  selectedComponentSub: Subscription;
  waterAssessment: WaterAssessment;
  selectedWaterTreatment: WaterTreatment;

  constructor(
    private waterAssessmentService: WaterAssessmentService,
    private waterSystemComponentService: WaterSystemComponentService,
  ) { }

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.waterTreatmentOptions = copyObject(inSystemTreatmentTypeOptions);
    this.selectedComponentSub = this.waterSystemComponentService.selectedInSystemTreatment.subscribe(selectedComponent => {
        this.selectedWaterTreatment = selectedComponent as WaterTreatment;
        this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
        this.waterSystemComponentService.inSystemTreatmentComponents.next(this.waterSystem.inSystemTreatment);
        if (this.selectedWaterTreatment) {
          this.initForm();
        }
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.waterSystemComponentService.selectedInSystemTreatment.next(undefined);
    this.selectedComponentSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    if (this.waterSystem.inSystemTreatment.length > 0) {
      if (!this.selectedWaterTreatment) {
        // todo broken
        // let lastModified: WaterTreatment = _.maxBy(this.waterSystem.inSystemTreatment, 'modifiedDate');
        let lastModified = this.waterSystem.inSystemTreatment[0];
        this.waterSystemComponentService.selectedInSystemTreatment.next(lastModified);
      }
    } else {
      this.waterSystemComponentService.selectedInSystemTreatment.next(undefined);
    }
  }

  initForm() {
    this.form = this.waterSystemComponentService.getWaterTreatmentFormFromObj(this.selectedWaterTreatment);
  }

  save(updated?: WaterTreatment) {
    if (!updated) {
      updated = this.waterSystemComponentService.getWaterTreatmentFromForm(this.form, this.selectedWaterTreatment);
    }
    let updateIndex: number = this.waterSystem.inSystemTreatment.findIndex(treatment => treatment.diagramNodeId === updated.diagramNodeId);
    this.waterSystem.inSystemTreatment[updateIndex] = updated;
    this.emitInSystemUpdate.emit(this.waterSystem);
  }

  addWaterTreatment() {
    let newWaterTreatment = getNewWaterTreatmentComponent(false, true);
    this.waterSystem.inSystemTreatment ? this.waterSystem.inSystemTreatment.push(newWaterTreatment) : this.waterSystem.inSystemTreatment = [newWaterTreatment];
    this.emitInSystemUpdate.emit(this.waterSystem);
    this.waterSystemComponentService.selectedInSystemTreatment.next(newWaterTreatment);
}

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

}
