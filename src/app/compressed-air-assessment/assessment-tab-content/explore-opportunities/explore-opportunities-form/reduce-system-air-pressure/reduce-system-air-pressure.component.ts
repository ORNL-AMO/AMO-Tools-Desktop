import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, Modification } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
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
  form: UntypedFormGroup;
  settings: Settings;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private reduceSystemAirPressureService: ReduceSystemAirPressureService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
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
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('reduceAirSystemAirPressure');
  }

  setData() {
    if (this.modification) {
      let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
      this.form = this.reduceSystemAirPressureService.getFormFromObj(this.modification.reduceSystemAirPressure, compressedAirAssessment.compressorInventoryItems);
    }
  }

  setOrderOptions() {
    if (this.modification) {
      this.orderOptions = new Array();
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

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    // let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceSystemAirPressure.order));
    // this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceSystemAirPressure = this.reduceSystemAirPressureService.getObjFromForm(this.form);
    // if (isOrderChange) {
    //   this.isFormChange = false;
    //   let newOrder: number = this.form.controls.order.value;
    //   this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'reduceSystemAirPressure', previousOrder, newOrder);
    // }

    this.modification.reduceSystemAirPressure = this.reduceSystemAirPressureService.getObjFromForm(this.form);
    this.compressedAirAssessmentService.updateModification(this.modification);
    // this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
  }
}
