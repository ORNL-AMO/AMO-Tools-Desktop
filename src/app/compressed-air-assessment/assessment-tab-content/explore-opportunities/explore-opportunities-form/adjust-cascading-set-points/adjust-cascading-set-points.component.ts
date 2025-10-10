import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdjustCascadingSetPoints, CascadingSetPointData, ReduceSystemAirPressure, CompressedAirAssessment, CompressorInventoryItem, Modification } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { PerformancePointsFormService } from '../../../../baseline-tab-content/inventory-setup/inventory/performance-points/performance-points-form.service';
import { AdjustCascadingSetPointsService, CompressorForm } from './adjust-cascading-set-points.service';
import { CompressorInventoryItemClass } from '../../../../calculations/CompressorInventoryItemClass';
import { ExploreOpportunitiesValidationService } from '../../../../compressed-air-assessment-validation/explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';

@Component({
  selector: 'app-adjust-cascading-set-points',
  templateUrl: './adjust-cascading-set-points.component.html',
  styleUrls: ['./adjust-cascading-set-points.component.css'],
  standalone: false
})
export class AdjustCascadingSetPointsComponent implements OnInit {

  selectedModificationSub: Subscription;
  adjustCascadingSetPoints: AdjustCascadingSetPoints
  isFormChange: boolean = false;
  modification: Modification;
  orderOptions: Array<number>;
  inventoryItems: Array<CompressorInventoryItem>;
  baselineSetPoints: Array<CascadingSetPointData>;
  setPointView: 'baseline' | 'modification' = 'modification';
  compressorForms: Array<CompressorForm>;
  settings: Settings;
  implementationCostForm: UntypedFormGroup;
  hasInvalidForm: boolean;
  validationStatusSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointsFormService: PerformancePointsFormService,
    private adjustCascadingSetPointsService: AdjustCascadingSetPointsService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService,
    private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      if (val && !this.isFormChange) {
        this.modification = val;
        this.setData();
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });

    this.validationStatusSub = this.exploreOpportunitiesValidationService.compressedAirModificationValid.subscribe(val => {
      this.hasInvalidForm = val.adjustCascadingSetPoints == false;
    });
  }

  ngOnDestroy() {
    this.selectedModificationSub.unsubscribe();
    this.validationStatusSub.unsubscribe();
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('adjustCascadingSetPoints');
  }

  setData() {
    if (this.modification) {
      this.adjustCascadingSetPoints = JSON.parse(JSON.stringify(this.modification.adjustCascadingSetPoints));
      this.implementationCostForm = this.adjustCascadingSetPointsService.getImplementationCostForm(this.adjustCascadingSetPoints);
      if (this.adjustCascadingSetPoints.order != 100) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        this.inventoryItems = compressedAirAssessment.compressorInventoryItems;
        let reduceSystemAirPressure: ReduceSystemAirPressure = this.modification.reduceSystemAirPressure;
        if (reduceSystemAirPressure.order != 100 && (this.adjustCascadingSetPoints.order > reduceSystemAirPressure.order)) {
          let inventoryItemsClass: Array<CompressorInventoryItemClass> = this.inventoryItems.map(item => { return new CompressorInventoryItemClass(item) });
          inventoryItemsClass.forEach(itemClass => {
            itemClass.reduceSystemPressure(reduceSystemAirPressure, compressedAirAssessment.systemInformation.atmosphericPressure, this.settings);
          });
          this.inventoryItems = inventoryItemsClass.map(itemClass => { return itemClass.toModel() });
        }
        this.checkAdjustCascadingPoints();
        this.compressorForms = this.adjustCascadingSetPointsService.getFormFromObj(this.adjustCascadingSetPoints.setPointData);
        this.setBaselineSetPoints();
      }
    }
  }

  setOrderOptions() {
    if (this.modification) {
      this.orderOptions = new Array();
      let allOrders: Array<number> = [
        this.modification.addPrimaryReceiverVolume.order,
        this.modification.reduceAirLeaks.order,
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
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.adjustCascadingSetPoints.order;
      this.modification = this.exploreOpportunitiesService.setOrdering(this.modification, 'adjustCascadingSetPoints', this.modification.adjustCascadingSetPoints.order, newOrder);
    }
    this.modification.adjustCascadingSetPoints = this.adjustCascadingSetPoints;
    this.compressedAirAssessmentService.updateModification(this.modification);
  }


  checkShowMaxFullFlow(compressorType: number, controlType: number): boolean {
    return this.performancePointsFormService.checkShowMaxFlowPerformancePoint(compressorType, controlType);
  }


  setBaselineSetPoints() {
    this.baselineSetPoints = new Array();
    this.inventoryItems.forEach(item => {
      this.baselineSetPoints.push({
        compressorId: item.itemId,
        controlType: item.compressorControls.controlType,
        compressorType: item.nameplateData.compressorType,
        fullLoadDischargePressure: item.performancePoints.fullLoad.dischargePressure,
        maxFullFlowDischargePressure: item.performancePoints.maxFullFlow.dischargePressure
      })
    })
  }

  setDataView(view: "baseline" | "modification") {
    this.setPointView = view;
  }

  checkMaxFullFlowDisabled(controlType: number): boolean {
    if (controlType == 4 || controlType == 5 || controlType == 6) {
      return false;
    } else {
      return true;
    }
  }

  checkAdjustCascadingPoints() {
    let updatePoints: boolean = false;
    this.adjustCascadingSetPoints.setPointData.forEach(pointData => {
      let compressor: CompressorInventoryItem = this.inventoryItems.find(item => { return item.itemId == pointData.compressorId });
      if (pointData.compressorType != compressor.nameplateData.compressorType || pointData.controlType != compressor.compressorControls.controlType || !pointData.fullLoadDischargePressure) {
        updatePoints = true;
        pointData.compressorType = compressor.nameplateData.compressorType;
        pointData.controlType = compressor.compressorControls.controlType;
        pointData.fullLoadDischargePressure = compressor.performancePoints.fullLoad.dischargePressure;
        pointData.maxFullFlowDischargePressure = compressor.performancePoints.maxFullFlow.dischargePressure;
      }
    });
    if (updatePoints) {
      this.save(false);
    }
  }

  resetData() {
    this.adjustCascadingSetPoints.setPointData.forEach(pointData => {
      let compressor: CompressorInventoryItem = this.inventoryItems.find(item => { return item.itemId == pointData.compressorId });
      pointData.compressorType = compressor.nameplateData.compressorType;
      pointData.controlType = compressor.compressorControls.controlType;
      pointData.fullLoadDischargePressure = compressor.performancePoints.fullLoad.dischargePressure;
      pointData.maxFullFlowDischargePressure = compressor.performancePoints.maxFullFlow.dischargePressure;
    });
    this.compressorForms = this.adjustCascadingSetPointsService.getFormFromObj(this.adjustCascadingSetPoints.setPointData);
    this.save(false);
  }

  saveFormChange(compressorForm: CompressorForm) {
    compressorForm.fullLoadDischargePressure = compressorForm.form.controls.fullLoadDischargePressure.value;
    compressorForm.maxFullFlowDischargePressure = compressorForm.form.controls.maxFullFlowDischargePressure.value;
    let maxFullFlowValidators: Array<ValidatorFn> = this.adjustCascadingSetPointsService.getMaxFullFlowValidators({
      compressorId: compressorForm.compressorId,
      controlType: compressorForm.controlType,
      compressorType: compressorForm.compressorType,
      fullLoadDischargePressure: compressorForm.fullLoadDischargePressure,
      maxFullFlowDischargePressure: compressorForm.maxFullFlowDischargePressure
    });
    compressorForm.form.controls.maxFullFlowDischargePressure.setValidators(maxFullFlowValidators);
    compressorForm.form.controls.maxFullFlowDischargePressure.updateValueAndValidity();
    this.adjustCascadingSetPoints.setPointData = this.adjustCascadingSetPointsService.updateObjFromForm(this.adjustCascadingSetPoints.setPointData, this.compressorForms);
    this.save(false);
  }

  saveImplementationCost() {
    this.adjustCascadingSetPoints = this.adjustCascadingSetPointsService.updateObjImplmentationCost(this.implementationCostForm, this.adjustCascadingSetPoints);
    this.save(false);
  }
}
