import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, Modification, ReduceAirLeaks } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import * as _ from 'lodash';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

@Component({
  selector: 'app-reduce-air-leaks',
  templateUrl: './reduce-air-leaks.component.html',
  styleUrls: ['./reduce-air-leaks.component.css']
})
export class ReduceAirLeaksComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  reduceAirLeaks: ReduceAirLeaks;
  isFormChange: boolean = false;
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
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.setData();
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('reduceAirLeaks');
  }

  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.reduceAirLeaks = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceAirLeaks));
    }
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.orderOptions = new Array();
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      let allOrders: Array<number> = [
        modification.addPrimaryReceiverVolume.order,
        modification.adjustCascadingSetPoints.order,
        modification.improveEndUseEfficiency.order,
        modification.reduceRuntime.order,
        modification.reduceSystemAirPressure.order,
        modification.useAutomaticSequencer.order
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
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceAirLeaks.order));
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceAirLeaks = this.reduceAirLeaks;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.reduceAirLeaks.order;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'reduceAirLeaks', previousOrder, newOrder);
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment);
  }
}
