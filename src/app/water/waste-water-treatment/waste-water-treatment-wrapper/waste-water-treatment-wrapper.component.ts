import { Component, Input } from '@angular/core';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WasteWaterTreatment, WaterAssessment } from '../../../shared/models/water-assessment';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { WasteWaterTreatmentService } from '../waste-water-treatment.service';

@Component({
  selector: 'app-waste-water-treatment-wrapper',
  templateUrl: './waste-water-treatment-wrapper.component.html',
  styleUrl: './waste-water-treatment-wrapper.component.css'
})
export class WasteWaterTreatmentWrapperComponent {
  @Input()
  waterAssessment: WaterAssessment;
  @Input()
  inSystemBasics: boolean;
  showConfirmDeleteModal: boolean = false;
  deleteIndex: number;
  confirmDeleteData: ConfirmDeleteData;

  constructor(
    private waterAssessmentService: WaterAssessmentService,
    private wasteWaterTreatmentService: WasteWaterTreatmentService,

  ) { }

  saveWasteWaterTreatment(updatedWasteWaterTreatment: WasteWaterTreatment, index: number) {
    this.wasteWaterTreatmentService.updateWasteWaterTreatment(this.waterAssessment.wasteWaterTreatments, updatedWasteWaterTreatment, index)
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }
  
  addNewWasteWaterTreatment() {
    this.waterAssessment.wasteWaterTreatments.push(
      this.wasteWaterTreatmentService.addWasteWaterTreatment()
    );
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }
  

  openConfirmDeleteModal(item: WasteWaterTreatment, index: number) {
    this.confirmDeleteData = {
      modalTitle: 'Delete Waste Water Treatment',
      confirmMessage: `Are you sure you want to delete '${item.treatmentType}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteIndex = index;
    this.waterAssessmentService.modalOpen.next(true);
  }

  onConfirmDeleteClose(shouldDelete: boolean) {
    if (shouldDelete) {
      this.deleteWasteWaterTreatment();
    }
    this.showConfirmDeleteModal = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

  deleteWasteWaterTreatment() {
    this.waterAssessment.wasteWaterTreatments.splice(this.deleteIndex, 1);
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }  

}