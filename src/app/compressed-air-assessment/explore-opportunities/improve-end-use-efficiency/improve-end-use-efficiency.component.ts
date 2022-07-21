import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, EndUseEfficiencyItem, EndUseEfficiencyReductionData, ImproveEndUseEfficiency, Modification, ProfileSummary, ProfileSummaryTotal, SystemProfileSetup } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResults, CompressedAirAssessmentResultsService } from '../../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService } from '../explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { ImproveEndUseEfficiencyService } from './improve-end-use-efficiency.service';

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
  baselineProfileSummaries: Array<{ dayType: CompressedAirDayType, profileSummaryTotals: Array<ProfileSummaryTotal> }>;
  hasInvalidForm: boolean;
  baselineResults: BaselineResults;
  settings: Settings;
  systemProfileSetup: SystemProfileSetup;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService, private improveEndUseEfficiencyService: ImproveEndUseEfficiencyService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.baselineResults = this.exploreOpportunitiesService.baselineResults;
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.systemProfileSetup = this.compressedAirAssessment.systemProfile.systemProfileSetup;
        this.setOrderOptions();
        this.setData()
        this.setHourIntervals();
      } else {
        this.isFormChange = false;
      }
    });
    this.setBaselineProfileSummaries();
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
      if (this.improveEndUseEfficiency.order != 100) {
        this.setHasInvalidForm();
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
    } else {
      this.setHasInvalidForm();
    }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
  }

  saveItemChange(saveData: { itemIndex: number, item: EndUseEfficiencyItem }) {
    this.improveEndUseEfficiency.endUseEfficiencyItems[saveData.itemIndex] = saveData.item;
    this.save(false);
  }

  setHourIntervals() {
    if (!this.hourIntervals || (this.hourIntervals && this.hourIntervals.length != this.systemProfileSetup.numberOfHours)) {
      this.hourIntervals = new Array();
      for (let i = 0; i < 24;) {
        this.hourIntervals.push(i + this.systemProfileSetup.dataInterval);
        i = i + this.systemProfileSetup.dataInterval;
      }
    }
  }

  toggleAll(itemIndex: number) {
    let toggleValue: boolean = !this.improveEndUseEfficiency.endUseEfficiencyItems[itemIndex].reductionData[0].data[0].applyReduction;
    for (let i = 0; i < this.improveEndUseEfficiency.endUseEfficiencyItems[itemIndex].reductionData.length; i++) {
      for (let dataIndex = 0; dataIndex < this.improveEndUseEfficiency.endUseEfficiencyItems[itemIndex].reductionData[i].data.length; dataIndex++) {
        this.improveEndUseEfficiency.endUseEfficiencyItems[itemIndex].reductionData[i].data[dataIndex].applyReduction = toggleValue;
      }
    }
    this.save(false);
  }

  trackByIdx(index: number, obj: any): any {
    return index;
  }

  addEfficiencyImprovement() {
    let reductionData: Array<EndUseEfficiencyReductionData> = JSON.parse(JSON.stringify(this.improveEndUseEfficiency.endUseEfficiencyItems[0].reductionData));
    for (let i = 0; i < reductionData.length; i++) {
      for (let x = 0; x < reductionData[i].data.length; x++) {
        reductionData[i].data[x].applyReduction = false;
        reductionData[i].data[x].reductionAmount = 0;
      }
    }
    this.improveEndUseEfficiency.endUseEfficiencyItems.push({
      reductionType: "Fixed",
      airflowReduction: undefined,
      reductionData: reductionData,
      name: 'Improve End Use Efficiency #' + (this.improveEndUseEfficiency.endUseEfficiencyItems.length + 1),
      substituteAuxiliaryEquipment: false,
      equipmentDemand: 0,
      collapsed: false,
      implementationCost: 0
    })
  }

  collapseEfficiency(itemIndex: number) {
    this.improveEndUseEfficiency.endUseEfficiencyItems[itemIndex].collapsed = !this.improveEndUseEfficiency.endUseEfficiencyItems[itemIndex].collapsed;
    this.save(false);
  }

  removeEndUseEfficiency(itemIndex: number) {
    this.improveEndUseEfficiency.endUseEfficiencyItems.splice(itemIndex, 1);
    this.save(false);
  }

  setBaselineProfileSummaries() {
    this.baselineProfileSummaries = new Array();
    this.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      let profileSummary: Array<ProfileSummary> = this.compressedAirAssessmentResultsService.calculateBaselineDayTypeProfileSummary(this.compressedAirAssessment, dayType, this.settings);
      let profileSummaryTotals: Array<ProfileSummaryTotal> = this.compressedAirAssessmentResultsService.calculateProfileSummaryTotals(this.compressedAirAssessment.compressorInventoryItems, dayType, profileSummary, this.compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval);
      this.baselineProfileSummaries.push({
        dayType: dayType,
        profileSummaryTotals: profileSummaryTotals
      });
    });
  }

  setHasInvalidForm() {
    this.hasInvalidForm = false;
    this.improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
      if (!this.hasInvalidForm) {
        let form: FormGroup = this.improveEndUseEfficiencyService.getFormFromObj(item, this.baselineResults);
        if (form.invalid) {
          this.hasInvalidForm = true;
        } else {
          let dataForms: Array<{ dayTypeName: string, dayTypeId: string, form: FormGroup }> = this.improveEndUseEfficiencyService.getDataForms(item, this.baselineProfileSummaries);
          dataForms.forEach(dataForm => {
            if (dataForm.form.invalid) {
              this.hasInvalidForm = true;
            }
          })
        }
      }
    });
    this.exploreOpportunitiesValidationService.improveEndUseEfficiencyValid.next(!this.hasInvalidForm);
  }
}
