import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, Modification, ReduceSystemAirPressure } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService } from '../../explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { ReduceSystemAirPressureService } from './reduce-system-air-pressure.service';

@Component({
  selector: 'app-reduce-system-air-pressure',
  templateUrl: './reduce-system-air-pressure.component.html',
  styleUrls: ['./reduce-system-air-pressure.component.css'],
  standalone: false
})
export class ReduceSystemAirPressureComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  isFormChange: boolean = false;
  modification: Modification;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  form: UntypedFormGroup;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private reduceSystemAirPressureService: ReduceSystemAirPressureService, private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.setOrderOptions();
        this.setData()
      } else {
        this.isFormChange = false;
      }
    });
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
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
    this.selectedModificationIdSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('reduceAirSystemAirPressure');
  }

  setData() {
    if (this.compressedAirAssessment && this.modification) {
      let reduceSystemAirPressure: ReduceSystemAirPressure = this.modification.reduceSystemAirPressure;
      this.form = this.reduceSystemAirPressureService.getFormFromObj(reduceSystemAirPressure, this.compressedAirAssessment.compressorInventoryItems);
      if (reduceSystemAirPressure.order != 100) {
        this.exploreOpportunitiesValidationService.reduceSystemAirPressureValid.next(this.form.valid);
      }
    }
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.modification) {
      this.orderOptions = new Array();
      if (this.modification) {
        let allOrders: Array<number> = [
          this.modification.addPrimaryReceiverVolume.order,
          this.modification.adjustCascadingSetPoints.order,
          this.modification.improveEndUseEfficiency.order,
          this.modification.reduceRuntime.order,
          this.modification.reduceAirLeaks.order,
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
    // let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceSystemAirPressure.order));
    // this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceSystemAirPressure = this.reduceSystemAirPressureService.getObjFromForm(this.form);
    // if (isOrderChange) {
    //   this.isFormChange = false;
    //   let newOrder: number = this.form.controls.order.value;
    //   this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'reduceSystemAirPressure', previousOrder, newOrder);
    // }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    this.exploreOpportunitiesValidationService.reduceSystemAirPressureValid.next(this.form.valid);
  }
}
