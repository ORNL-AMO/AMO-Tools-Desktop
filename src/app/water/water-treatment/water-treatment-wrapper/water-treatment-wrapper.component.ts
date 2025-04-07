import { Component, Input } from '@angular/core';
import { WaterTreatmentService } from '../water-treatment.service';
import { WaterAssessmentService } from '../../water-assessment.service';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { WaterAssessment, WaterTreatment } from 'process-flow-lib';

@Component({
  selector: 'app-water-treatment-wrapper',
  templateUrl: './water-treatment-wrapper.component.html',
  styleUrl: './water-treatment-wrapper.component.css'
})
export class WaterTreatmentWrapperComponent {
  @Input()
  waterAssessment: WaterAssessment;
  @Input()
  inSystemBasics: boolean;
  showConfirmDeleteModal: boolean = false;
  deleteIndex: number;
  confirmDeleteData: ConfirmDeleteData;

  constructor(
    private waterAssessmentService: WaterAssessmentService,
    private waterTreatmentService: WaterTreatmentService,

  ) { }

  saveWaterTreatment(updatedWaterTreatment: WaterTreatment, index: number) {
    this.waterTreatmentService.updateWaterTreatment(this.waterAssessment.waterTreatments, updatedWaterTreatment, index)
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }

  addNewWaterTreatment() {
    this.waterAssessment.waterTreatments.push(
      this.waterTreatmentService.addWaterTreatmentComponent(undefined, true)
    );
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }

  openConfirmDeleteModal(item: WaterTreatment, index: number) {
    this.confirmDeleteData = {
      modalTitle: 'Delete Added Motor Energy',
      confirmMessage: `Are you sure you want to delete '${item.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteIndex = index;
    this.waterAssessmentService.modalOpen.next(true);
  }

  onConfirmDeleteClose(shouldDelete: boolean) {
    if (shouldDelete) {
      this.deleteWaterTreatment();
    }
    this.showConfirmDeleteModal = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

  deleteWaterTreatment() {
    this.waterAssessment.waterTreatments.splice(this.deleteIndex, 1);
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }

}
