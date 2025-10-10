import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AddPrimaryReceiverVolume, CompressedAirAssessment, Modification } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService } from '../../../../compressed-air-assessment-validation/explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { AddReceiverVolumeService } from './add-receiver-volume.service';

@Component({
  selector: 'app-add-receiver-volume',
  templateUrl: './add-receiver-volume.component.html',
  styleUrls: ['./add-receiver-volume.component.css'],
  standalone: false
})
export class AddReceiverVolumeComponent implements OnInit {

  selectedModificationSub: Subscription;
  isFormChange: boolean = false;
  existingCapacity: number;
  modification: Modification;
  orderOptions: Array<number>;
  settings: Settings;
  increasedVolumeError: string;

  form: UntypedFormGroup
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private addReceiverVolumeService: AddReceiverVolumeService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.existingCapacity = compressedAirAssessment.systemInformation.totalAirStorage;

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      if (val && !this.isFormChange) {
        this.modification = val;
        this.setData();
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });
  }

  ngOnDestroy() {
    this.selectedModificationSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('addPrimaryReceiverVolume');
  }

  setData() {
    this.form = this.addReceiverVolumeService.getFormFromObj(this.modification.addPrimaryReceiverVolume);
  }

  setOrderOptions() {
    if (this.modification) {
      this.orderOptions = new Array();
      if (this.modification) {
        let allOrders: Array<number> = [
          this.modification.reduceAirLeaks.order,
          this.modification.adjustCascadingSetPoints.order,
          this.modification.improveEndUseEfficiency.order,
          this.modification.reduceRuntime.order,
          this.modification.reduceSystemAirPressure.order,
          this.modification.useAutomaticSequencer.order,
          this.modification.replaceCompressor.order
        ];
        allOrders = allOrders.filter(order => { return order != 100 });
        let numOrdersOn: number = allOrders.length;
        for (let i = 1; i <= numOrdersOn + 1; i++) {
          this.orderOptions.push(i);
        }
      }
    }
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    // let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].addPrimaryReceiverVolume.order));

    // this.compressedAirAssessment.modifications[this.selectedModificationIndex].addPrimaryReceiverVolume = this.addReceiverVolumeService.getObjFromForm(this.form);
    // if (isOrderChange) {
    //   this.isFormChange = false;
    //   let newOrder: number = this.form.controls.order.value;
    //   this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'addPrimaryReceiverVolume', previousOrder, newOrder);
    // }
    // this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    // this.exploreOpportunitiesValidationService.addReceiverVolumeValid.next(this.form.valid);
    this.modification.addPrimaryReceiverVolume = this.addReceiverVolumeService.getObjFromForm(this.form);
    this.compressedAirAssessmentService.updateModification(this.modification);
  }
}
