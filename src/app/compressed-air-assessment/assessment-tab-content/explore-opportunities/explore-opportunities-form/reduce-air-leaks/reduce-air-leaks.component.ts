import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Modification } from '../../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { UntypedFormGroup } from '@angular/forms';
import { ReduceAirLeaksService } from './reduce-air-leaks.service';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentBaselineResults } from '../../../../calculations/CompressedAirAssessmentBaselineResults';

@Component({
  selector: 'app-reduce-air-leaks',
  templateUrl: './reduce-air-leaks.component.html',
  styleUrls: ['./reduce-air-leaks.component.css'],
  standalone: false
})
export class ReduceAirLeaksComponent implements OnInit {

  selectedModificationSub: Subscription;
  isFormChange: boolean = false;
  modification: Modification;
  orderOptions: Array<number>;
  form: UntypedFormGroup;
  compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private reduceAirLeaksService: ReduceAirLeaksService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentBaselineResults = this.compressedAirAssessmentService.compressedAirAssessmentBaselineResults.getValue();

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
    this.compressedAirAssessmentService.focusedField.next('reduceAirLeaks');
  }

  setData() {
    this.form = this.reduceAirLeaksService.getFormFromObj(this.modification.reduceAirLeaks, this.compressedAirAssessmentBaselineResults.baselineResults);
  }

  setOrderOptions() {
    if (this.modification) {
      this.orderOptions = new Array();
      let allOrders: Array<number> = [
        this.modification.addPrimaryReceiverVolume.order,
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

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    // let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceAirLeaks.order));
    // let reduceAirLeaks: ReduceAirLeaks = this.reduceAirLeaksService.getObjFromForm(this.form);
    // this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceAirLeaks = reduceAirLeaks;
    // if (isOrderChange) {
    //   this.isFormChange = false;
    //   let newOrder: number = this.form.controls.order.value;
    //   this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'reduceAirLeaks', previousOrder, newOrder);
    // }
    this.modification.reduceAirLeaks = this.reduceAirLeaksService.getObjFromForm(this.form);
    this.compressedAirAssessmentService.updateModification(this.modification);
  }
}
