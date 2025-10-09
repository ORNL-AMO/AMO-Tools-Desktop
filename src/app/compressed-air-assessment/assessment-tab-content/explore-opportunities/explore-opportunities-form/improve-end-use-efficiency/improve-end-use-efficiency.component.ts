import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, EndUseEfficiencyItem, EndUseEfficiencyReductionData, ImproveEndUseEfficiency, Modification, SystemProfileSetup } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService } from '../../explore-opportunities-validation.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { ImproveEndUseEfficiencyService } from './improve-end-use-efficiency.service';
import { CompressedAirAssessmentBaselineResults } from '../../../../calculations/CompressedAirAssessmentBaselineResults';
import { getHourIntervals } from '../../../../compressed-air-assessment-validation/compressedAirValidationFunctions';

@Component({
  selector: 'app-improve-end-use-efficiency',
  templateUrl: './improve-end-use-efficiency.component.html',
  styleUrls: ['./improve-end-use-efficiency.component.css'],
  standalone: false
})
export class ImproveEndUseEfficiencyComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  improveEndUseEfficiency: ImproveEndUseEfficiency;
  isFormChange: boolean = false;
  hourIntervals: Array<number>;
  modification: Modification;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  hasInvalidForm: boolean;

  compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults;

  settings: Settings;
  systemProfileSetup: SystemProfileSetup;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private improveEndUseEfficiencyService: ImproveEndUseEfficiencyService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentBaselineResults = this.exploreOpportunitiesService.compressedAirAssessmentBaselineResults.getValue();
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        this.systemProfileSetup = this.compressedAirAssessment.systemProfile.systemProfileSetup;
        this.setOrderOptions();
        this.setData()
        if (!this.hourIntervals || (this.hourIntervals && this.hourIntervals.length != this.systemProfileSetup.numberOfHours)) {
          this.hourIntervals = getHourIntervals(this.systemProfileSetup, 24);
        }
      } else {
        this.isFormChange = false;
      }
    });


    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      if (val && !this.isFormChange) {
        this.modification = val;
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
    if (this.compressedAirAssessment && this.modification) {
      this.improveEndUseEfficiency = this.modification.improveEndUseEfficiency;
      if (this.improveEndUseEfficiency.order != 100) {
        this.setHasInvalidForm();
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
          this.modification.reduceAirLeaks.order,
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
  }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    // let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].improveEndUseEfficiency.order));
    // this.compressedAirAssessment.modifications[this.selectedModificationIndex].improveEndUseEfficiency = this.improveEndUseEfficiency;
    // if (isOrderChange) {
    //   this.isFormChange = false;
    //   let newOrder: number = this.improveEndUseEfficiency.order;
    //   this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'improveEndUseEfficiency', previousOrder, newOrder);
    // } else {
    //   this.setHasInvalidForm();
    // }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
  }

  saveItemChange(saveData: { itemIndex: number, item: EndUseEfficiencyItem }) {
    this.improveEndUseEfficiency.endUseEfficiencyItems[saveData.itemIndex] = saveData.item;
    this.save(false);
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

  setHasInvalidForm() {
    this.hasInvalidForm = false;
    this.improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
      if (!this.hasInvalidForm) {
        let form: UntypedFormGroup = this.improveEndUseEfficiencyService.getFormFromObj(item, this.compressedAirAssessmentBaselineResults.baselineResults);
        if (form.invalid) {
          this.hasInvalidForm = true;
        } else {
          let dataForms: Array<{ dayTypeName: string, dayTypeId: string, form: UntypedFormGroup }> = this.improveEndUseEfficiencyService.getDataForms(item, this.compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries);
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
