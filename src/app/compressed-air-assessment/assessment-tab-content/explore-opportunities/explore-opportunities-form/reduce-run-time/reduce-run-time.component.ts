import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, Modification, ReduceRuntime } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ReduceRunTimeService } from './reduce-run-time.service';
import { CompressedAirAssessmentModificationResults } from '../../../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { ResultingSystemProfileValidation } from '../../../../calculations/modifications/energyEfficiencyMeasures/ResultingSystemProfileValidation';
import { CompressedAirDataManagementService } from '../../../../compressed-air-data-management.service';

@Component({
  selector: 'app-reduce-run-time',
  templateUrl: './reduce-run-time.component.html',
  styleUrls: ['./reduce-run-time.component.css'],
  standalone: false
})
export class ReduceRunTimeComponent implements OnInit {

  selectedModificationSub: Subscription;
  reduceRuntime: ReduceRuntime
  isFormChange: boolean = false;
  modification: Modification;
  orderOptions: Array<number>;
  compressedAirAssessment: CompressedAirAssessment;
  compressorInventoryItems: Array<CompressorInventoryItem>;
  modificationResultsSub: Subscription;

  dayTypeOptions: Array<ResultingSystemProfileValidation>;
  selectedDayType: ResultingSystemProfileValidation;
  form: UntypedFormGroup;
  hasInvalidDayType: boolean;
  settings: Settings;
  numberPipeDecimals: string;
  displayShutdownTimer: boolean;
  fillRightHourInterval: boolean;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private reduceRunTimeService: ReduceRunTimeService,
    private exploreOpportunitiesService: ExploreOpportunitiesService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.numberPipeDecimals = '1.0-2'
    } else {
      this.numberPipeDecimals = '1.0-0'
    }
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.displayShutdownTimer = this.compressedAirAssessment.systemInformation.multiCompressorSystemControls != 'loadSharing';
    this.compressorInventoryItems = this.compressedAirAssessment.compressorInventoryItems.concat(this.compressedAirAssessment.replacementCompressorInventoryItems);

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      if (val && !this.isFormChange) {
        this.modification = val;
        this.setData();
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });

    this.modificationResultsSub = this.compressedAirAssessmentService.compressedAirAssessmentModificationResults.subscribe(val => {
      this.setDayTypes(val);
    });
  }

  ngOnDestroy() {
    this.selectedModificationSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('reduceRuntime');
  }

  setData() {
    this.reduceRuntime = JSON.parse(JSON.stringify(this.modification.reduceRuntime));
    this.form = this.reduceRunTimeService.getFormFromObj(this.reduceRuntime);
  }

  setOrderOptions() {
    if (this.modification) {
      this.orderOptions = new Array();
      let allOrders: Array<number> = [
        this.modification.addPrimaryReceiverVolume.order,
        this.modification.adjustCascadingSetPoints.order,
        this.modification.improveEndUseEfficiency.order,
        this.modification.reduceAirLeaks.order,
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

  setHourIntervalState(intervalData: Array<{
    isCompressorOn: boolean,
    timeInterval: number,
  }>, data: {
    isCompressorOn: boolean,
    timeInterval: number,
  }, dataIndex: number) {
    if (this.fillRightHourInterval) {
      for (let index = dataIndex + 1; index <= intervalData.length - 1; index++) {
        intervalData[index].isCompressorOn = data.isCompressorOn;
      }
    }
    this.save(false);
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    if (isOrderChange) {
      this.isFormChange = false;
      this.modification = this.exploreOpportunitiesService.setOrdering(this.modification, 'reduceRuntime', this.modification.reduceRuntime.order, this.form.controls.order.value);
    }
    this.modification.reduceRuntime = this.reduceRunTimeService.updateObjFromForm(this.form, this.reduceRuntime);
    if (isOrderChange) {
      let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
      this.modification = this.compressedAirDataManagementService.updateReplacementCompressors(this.modification, compressedAirAssessment);
    }
    this.compressedAirAssessmentService.updateModification(this.modification);
  }

  setDayTypes(compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults) {
    if (compressedAirAssessmentModificationResults && this.reduceRuntime.order != 100) {
      this.dayTypeOptions = compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries.map(dayTypeModResult => { return dayTypeModResult.reduceRunTimeProfileValidation });
      if (!this.selectedDayType) {
        this.selectedDayType = this.dayTypeOptions[0];
      } else {
        this.selectedDayType = this.dayTypeOptions.find(dayTypeOption => { return dayTypeOption.dayType.dayTypeId == this.selectedDayType.dayType.dayTypeId });
      }
      this.hasInvalidDayType = this.dayTypeOptions.some(dayTypeOption => { return dayTypeOption.isValid == false });
    }
  }
}