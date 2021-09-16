import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, ImproveEndUseEfficiency, Modification } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';

@Component({
  selector: 'app-improve-end-use-efficiency',
  templateUrl: './improve-end-use-efficiency.component.html',
  styleUrls: ['./improve-end-use-efficiency.component.css']
})
export class ImproveEndUseEfficiencyComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  improveEndUseEfficiency: ImproveEndUseEfficiency;
  isFormChange: boolean = false;
  hourIntervals: Array<number>;
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
    this.setHourIntervals();
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.setData()
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
    this.compressedAirAssessmentService.focusedField.next('improveEndUseEfficiency');
  }

  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined && this.compressedAirAssessment.modifications[this.selectedModificationIndex]) {
      this.improveEndUseEfficiency = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].improveEndUseEfficiency));
    }
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
      this.orderOptions = new Array();
      let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
      if (modification) {
        let allOrders: Array<number> = [
          modification.addPrimaryReceiverVolume.order,
          modification.adjustCascadingSetPoints.order,
          modification.reduceAirLeaks.order,
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
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].improveEndUseEfficiency.order));
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].improveEndUseEfficiency = this.improveEndUseEfficiency;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.improveEndUseEfficiency.order;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'improveEndUseEfficiency', previousOrder, newOrder);
    }

    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment);
  }

  setReductionType(str: "Fixed" | "Variable") {
    this.improveEndUseEfficiency.reductionType = str;
    this.save(false);
  }

  setHourIntervals() {
    this.hourIntervals = new Array();
    for (let i = 0; i < 24; i++) {
      this.hourIntervals.push(i);
    }
  }

  toggleAll() {
    let toggleValue: boolean = !this.improveEndUseEfficiency.reductionData[0].data[0].applyReduction;
    for (let i = 0; i < this.improveEndUseEfficiency.reductionData.length; i++) {
      for (let dataIndex = 0; dataIndex < this.improveEndUseEfficiency.reductionData[i].data.length; dataIndex++) {
        this.improveEndUseEfficiency.reductionData[i].data[dataIndex].applyReduction = toggleValue;
      }
    }
    this.save(false);
  }

  trackByIdx(index: number, obj: any): any {
    return index;
  }
}
