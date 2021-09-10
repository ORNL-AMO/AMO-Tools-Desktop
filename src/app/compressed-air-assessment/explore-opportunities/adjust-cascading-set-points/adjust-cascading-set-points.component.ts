import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdjustCascadingSetPoints, CompressedAirAssessment, Modification } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

@Component({
  selector: 'app-adjust-cascading-set-points',
  templateUrl: './adjust-cascading-set-points.component.html',
  styleUrls: ['./adjust-cascading-set-points.component.css']
})
export class AdjustCascadingSetPointsComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  adjustCascadingSetPoints: AdjustCascadingSetPoints
  isFormChange: boolean = false;
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,  private exploreOpportunitiesService: ExploreOpportunitiesService) { }

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
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.adjustCascadingSetPoints = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].adjustCascadingSetPoints));
    }
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.orderOptions = new Array();
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      let allOrders: Array<number> = [
        modification.addPrimaryReceiverVolume.order,
        modification.reduceAirLeaks.order,
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
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].adjustCascadingSetPoints.order));
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].adjustCascadingSetPoints = this.adjustCascadingSetPoints;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.adjustCascadingSetPoints.order;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'adjustCascadingSetPoints', previousOrder, newOrder);
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment);
  }
}
