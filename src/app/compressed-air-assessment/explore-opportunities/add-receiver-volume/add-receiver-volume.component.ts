import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AddPrimaryReceiverVolume, CompressedAirAssessment, Modification } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

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
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.setOrderOptions();
        this.setData()
      } else {
        this.isFormChange = false;
      }
    });

    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.existingCapacity = this.compressedAirAssessment.systemInformation.totalAirStorage;
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.setData();
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('addPrimaryReceiverVolume');
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
  
  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.addPrimaryReceiverVolume = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].addPrimaryReceiverVolume));
    }
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.orderOptions = new Array();
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      let allOrders: Array<number> = [
        modification.reduceAirLeaks.order,
        modification.adjustCascadingSetPoints.order,
        modification.improveEndUseEfficiency.order,
        modification.reduceRuntime.order,
        modification.reduceSystemAirPressure.order,
        modification.useAutomaticSequencer.order,
        modification.useUnloadingControls.order
      ];
      allOrders = allOrders.filter(order => { return order != 100 });
      let numOrdersOn: number = allOrders.length;
      for (let i = 1; i <= numOrdersOn + 1; i++) {
        this.orderOptions.push(i);
      }
    }
  }
  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].addPrimaryReceiverVolume.order));
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].addPrimaryReceiverVolume = this.addPrimaryReceiverVolume;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.addPrimaryReceiverVolume.order;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'addPrimaryReceiverVolume', previousOrder, newOrder);
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment);
  }
}
