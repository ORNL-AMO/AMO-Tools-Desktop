import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, Modification, ReduceAirLeaks } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import * as _ from 'lodash';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { FormGroup } from '@angular/forms';
import { ReduceAirLeaksService } from './reduce-air-leaks.service';
import { BaselineResults, CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { ExploreOpportunitiesValidationService } from '../explore-opportunities-validation.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-reduce-air-leaks',
  templateUrl: './reduce-air-leaks.component.html',
  styleUrls: ['./reduce-air-leaks.component.css']
})
export class ReduceAirLeaksComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  // reduceAirLeaks: ReduceAirLeaks;
  isFormChange: boolean = false;
  selectedModificationIndex: number;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  form: FormGroup;
  baselineResults: BaselineResults;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private reduceAirLeaksService: ReduceAirLeaksService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.baselineResults = this.exploreOpportunitiesService.baselineResults;
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
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined && this.compressedAirAssessment.modifications[this.selectedModificationIndex]) {
      let reduceAirLeaks: ReduceAirLeaks = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceAirLeaks));
      this.form = this.reduceAirLeaksService.getFormFromObj(reduceAirLeaks, this.baselineResults);
      if (reduceAirLeaks.order != 100) {
        this.exploreOpportunitiesValidationService.reduceAirLeaksValid.next(this.form.valid);
      }
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
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceAirLeaks.order));
    let reduceAirLeaks: ReduceAirLeaks = this.reduceAirLeaksService.getObjFromForm(this.form);
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceAirLeaks = reduceAirLeaks;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.form.controls.order.value;
      this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'reduceAirLeaks', previousOrder, newOrder);
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    this.exploreOpportunitiesValidationService.reduceAirLeaksValid.next(this.form.valid);
  }
}
