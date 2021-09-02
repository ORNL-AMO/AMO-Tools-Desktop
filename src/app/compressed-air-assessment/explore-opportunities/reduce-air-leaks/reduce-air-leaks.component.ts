import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, Modification, ReduceAirLeaks } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-reduce-air-leaks',
  templateUrl: './reduce-air-leaks.component.html',
  styleUrls: ['./reduce-air-leaks.component.css']
})
export class ReduceAirLeaksComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  reduceAirLeaks: ReduceAirLeaks;
  isFormChange: boolean = false;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.reduceAirLeaks = compressedAirAssessment.modifications[modificationIndex].reduceAirLeaks;
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
  // setReduceAirLeaks() {
  //   this.save();
  // }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
    let previousOrder: number = compressedAirAssessment.modifications[modificationIndex].reduceAirLeaks.order;
    compressedAirAssessment.modifications[modificationIndex].reduceAirLeaks = this.reduceAirLeaks;
    if (isOrderChange) {
      let selectedOrder: number = this.reduceAirLeaks.order;
      compressedAirAssessment.modifications[modificationIndex] = this.updateOrders(selectedOrder, previousOrder, compressedAirAssessment.modifications[modificationIndex]);
      this.reduceAirLeaks.order = compressedAirAssessment.modifications[modificationIndex].reduceAirLeaks.order;
      console.log(compressedAirAssessment.modifications[modificationIndex]);
    }

    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }

  updateOrders(selectedOrder: number, previousOrder: number, modification: Modification): Modification {
    if (selectedOrder == 100) {
      modification = this.reduceOrders(previousOrder, modification);
    } else {
      let allOrders: Array<number> = [
        modification.addPrimaryReceiverVolume.order,
        modification.adjustCascadingSetPoints.order,
        modification.improveEndUseEfficiency.order,
        modification.reduceRuntime.order,
        modification.reduceSystemAirPressure.order,
        modification.useAutomaticSequencer.order,
        modification.useUnloadingControls.order
      ];
      let maxOrder: number = _.max(allOrders);
      if (maxOrder < (selectedOrder - 1)) {
        modification.reduceAirLeaks.order = maxOrder + 1;
      } else {
        let hasSameOrder: number = allOrders.find(order => { return order == selectedOrder });
        if (hasSameOrder) {
          modification = this.increaseOrders(selectedOrder, modification);
        }
      }
    }
    return modification;
  }


  reduceOrders(previousOrder: number, modification: Modification): Modification {
    console.log('reduce');
    console.log(previousOrder);
    if (modification.addPrimaryReceiverVolume.order != 100 && modification.addPrimaryReceiverVolume.order > previousOrder) {
      modification.addPrimaryReceiverVolume.order--;
    }
    if (modification.adjustCascadingSetPoints.order != 100 && modification.adjustCascadingSetPoints.order > previousOrder) {
      modification.adjustCascadingSetPoints.order--;
    }
    if (modification.improveEndUseEfficiency.order != 100 && modification.improveEndUseEfficiency.order > previousOrder) {
      modification.improveEndUseEfficiency.order--;
    }
    if (modification.reduceRuntime.order != 100 && modification.reduceRuntime.order > previousOrder) {
      modification.reduceRuntime.order--;
    }
    if (modification.reduceSystemAirPressure.order != 100 && modification.reduceSystemAirPressure.order > previousOrder) {
      modification.reduceSystemAirPressure.order--;
    }
    if (modification.useAutomaticSequencer.order != 100 && modification.useAutomaticSequencer.order > previousOrder) {
      modification.useAutomaticSequencer.order--;
    }
    if (modification.useUnloadingControls.order != 100 && modification.useUnloadingControls.order > previousOrder) {
      modification.useUnloadingControls.order--;
    }
    return modification;
  }

  increaseOrders(selectedOrder: number, modification: Modification): Modification {
    if (modification.addPrimaryReceiverVolume.order != 100 && modification.addPrimaryReceiverVolume.order >= selectedOrder) {
      modification.addPrimaryReceiverVolume.order++;
      if(modification.addPrimaryReceiverVolume.order == selectedOrder){
        return modification;
      }
    }
    if (modification.adjustCascadingSetPoints.order != 100 && modification.adjustCascadingSetPoints.order >= selectedOrder) {
      modification.adjustCascadingSetPoints.order++;
      if(modification.addPrimaryReceiverVolume.order == selectedOrder){
        return modification;
      }
    }
    if (modification.improveEndUseEfficiency.order != 100 && modification.improveEndUseEfficiency.order >= selectedOrder) {
      modification.improveEndUseEfficiency.order++;
      if(modification.addPrimaryReceiverVolume.order == selectedOrder){
        return modification;
      }
    }
    if (modification.reduceRuntime.order != 100 && modification.reduceRuntime.order >= selectedOrder) {
      modification.reduceRuntime.order++;
      if(modification.addPrimaryReceiverVolume.order == selectedOrder){
        return modification;
      }
    }
    if (modification.reduceSystemAirPressure.order != 100 && modification.reduceSystemAirPressure.order >= selectedOrder) {
      modification.reduceSystemAirPressure.order++;
      if(modification.addPrimaryReceiverVolume.order == selectedOrder){
        return modification;
      }
    }
    if (modification.useAutomaticSequencer.order != 100 && modification.useAutomaticSequencer.order >= selectedOrder) {
      modification.useAutomaticSequencer.order++;
      if(modification.addPrimaryReceiverVolume.order == selectedOrder){
        return modification;
      }
    }
    if (modification.useUnloadingControls.order != 100 && modification.useUnloadingControls.order >= selectedOrder) {
      modification.useUnloadingControls.order++;
      if(modification.addPrimaryReceiverVolume.order == selectedOrder){
        return modification;
      }
    }
    return modification;
  }

}
