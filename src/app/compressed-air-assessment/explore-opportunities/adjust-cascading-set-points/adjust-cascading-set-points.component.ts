import { Component, OnInit } from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdjustCascadingSetPoints, CascadingSetPointData, ReduceSystemAirPressure, CompressedAirAssessment, CompressorInventoryItem, Modification } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { PerformancePointsFormService } from '../../inventory/performance-points/performance-points-form.service';
import { ExploreOpportunitiesValidationService } from '../explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { AdjustCascadingSetPointsService, CompressorForm } from './adjust-cascading-set-points.service';

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
  inventoryItems: Array<CompressorInventoryItem>;
  baselineSetPoints: Array<CascadingSetPointData>;
  setPointView: 'baseline' | 'modification' = 'modification';
  compressorForms: Array<CompressorForm>;
  settings: Settings;
  implementationCostForm: FormGroup;
  hasInvalidForm: boolean;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private performancePointsFormService: PerformancePointsFormService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService,
    private adjustCascadingSetPointsService: AdjustCascadingSetPointsService, private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

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

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('adjustCascadingSetPoints');
  }

  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined && this.compressedAirAssessment.modifications[this.selectedModificationIndex]) {
      this.adjustCascadingSetPoints = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].adjustCascadingSetPoints));
      this.implementationCostForm = this.adjustCascadingSetPointsService.getImplementationCostForm(this.adjustCascadingSetPoints);
      if (this.adjustCascadingSetPoints.order != 100) {
        this.inventoryItems = JSON.parse(JSON.stringify(this.compressedAirAssessment.compressorInventoryItems));
        let reduceSystemAirPressure: ReduceSystemAirPressure = this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceSystemAirPressure;
        if (reduceSystemAirPressure.order != 100 && (this.adjustCascadingSetPoints.order > reduceSystemAirPressure.order)) {
          this.inventoryItems = this.compressedAirAssessmentResultsService.reduceSystemAirPressureAdjustCompressors(this.inventoryItems, this.compressedAirAssessment.modifications[this.selectedModificationIndex].reduceSystemAirPressure, this.compressedAirAssessment.systemInformation.atmosphericPressure, this.settings)
        }
        this.checkAdjustCascadingPoints();
        this.compressorForms = this.adjustCascadingSetPointsService.getFormFromObj(this.adjustCascadingSetPoints.setPointData);
        this.setHasInvalidForm()
        this.setBaselineSetPoints();
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
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
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
    this.setHasInvalidForm()
    this.save(false);
  }

  saveImplementationCost() {
    this.adjustCascadingSetPoints = this.adjustCascadingSetPointsService.updateObjImplmentationCost(this.implementationCostForm, this.adjustCascadingSetPoints);
    this.save(false);
  }

  setHasInvalidForm() {
    if (this.adjustCascadingSetPoints.order != 100) {
      this.hasInvalidForm = false;
      this.compressorForms.forEach(compressorForm => {
        if (compressorForm.form.invalid) {
          this.hasInvalidForm = true;
        }
      });
      this.exploreOpportunitiesValidationService.adjustCascadingSetPointsValid.next(!this.hasInvalidForm);
    }
  }
}
