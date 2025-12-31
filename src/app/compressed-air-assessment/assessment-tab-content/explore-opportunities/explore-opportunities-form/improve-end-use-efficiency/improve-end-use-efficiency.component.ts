import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, EndUseEfficiencyItem, EndUseEfficiencyReductionData, ImproveEndUseEfficiency, Modification, SystemProfileSetup } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ExploreOpportunitiesValidationService } from '../../../../compressed-air-assessment-validation/explore-opportunities-validation.service';
import { CompressedAirAssessmentBaselineResults } from '../../../../calculations/CompressedAirAssessmentBaselineResults';
import { getHourIntervals } from '../../../../compressed-air-assessment-validation/compressedAirValidationFunctions';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';

@Component({
  selector: 'app-improve-end-use-efficiency',
  templateUrl: './improve-end-use-efficiency.component.html',
  styleUrls: ['./improve-end-use-efficiency.component.css'],
  standalone: false
})
export class ImproveEndUseEfficiencyComponent implements OnInit {

  selectedModificationSub: Subscription;
  improveEndUseEfficiency: ImproveEndUseEfficiency;
  isFormChange: boolean = false;
  hourIntervals: Array<number>;
  modification: Modification;
  orderOptions: Array<number>;

  compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults;

  settings: Settings;
  systemProfileSetup: SystemProfileSetup;

  hasInvalidForm: boolean;
  validationStatusSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService,
    private exploreOpportunitiesService: ExploreOpportunitiesService
  ) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessmentBaselineResults = this.compressedAirAssessmentService.compressedAirAssessmentBaselineResults.getValue();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.systemProfileSetup = compressedAirAssessment.systemProfile.systemProfileSetup;
    this.hourIntervals = getHourIntervals(this.systemProfileSetup, 24);

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      if (val && !this.isFormChange) {
        this.modification = val;
        this.setData()
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });

    this.validationStatusSub = this.exploreOpportunitiesValidationService.compressedAirModificationValid.subscribe(val => {
      this.hasInvalidForm = val?.improveEndUseEfficiency == false;
    })
  }

  ngOnDestroy() {
    this.selectedModificationSub.unsubscribe();
    this.validationStatusSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('improveEndUseEfficiency');
  }

  setData() {
    this.improveEndUseEfficiency = JSON.parse(JSON.stringify(this.modification.improveEndUseEfficiency));
  }

  setOrderOptions() {
    if (this.modification) {
      this.orderOptions = new Array();
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

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.improveEndUseEfficiency.order;
      this.modification = this.exploreOpportunitiesService.setOrdering(this.modification, 'improveEndUseEfficiency', this.modification.improveEndUseEfficiency.order, newOrder);
    } 
    this.modification.improveEndUseEfficiency = this.improveEndUseEfficiency;
    this.compressedAirAssessmentService.updateModification(this.modification);
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
}
