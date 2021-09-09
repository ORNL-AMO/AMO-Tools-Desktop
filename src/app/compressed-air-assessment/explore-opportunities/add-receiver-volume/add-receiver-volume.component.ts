import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AddPrimaryReceiverVolume, CompressedAirAssessment, Modification } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-add-receiver-volume',
  templateUrl: './add-receiver-volume.component.html',
  styleUrls: ['./add-receiver-volume.component.css']
})
export class AddReceiverVolumeComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  addPrimaryReceiverVolume: AddPrimaryReceiverVolume;
  isFormChange: boolean = false;
  existingCapacity: number;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        this.existingCapacity = compressedAirAssessment.systemInformation.totalAirStorage;
        let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.addPrimaryReceiverVolume = compressedAirAssessment.modifications[modificationIndex].addPrimaryReceiverVolume;
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('addPrimaryReceiverVolume');
  }

  setAddPrimaryReceiverVolume() {
    this.save();
  }

  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
    compressedAirAssessment.modifications[modificationIndex].addPrimaryReceiverVolume = this.addPrimaryReceiverVolume;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }
}
