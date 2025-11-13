import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, Modification, ReduceRuntime, ReplaceCompressor } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ReplaceCompressorService } from './replace-compressor.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { PerformancePointsFormService } from '../../../../baseline-tab-content/inventory-setup/inventory/performance-points/performance-points-form.service';
import { ResultingSystemProfileValidation } from '../../../../calculations/modifications/energyEfficiencyMeasures/ResultingSystemProfileValidation';

@Component({
  selector: 'app-replace-compressor',
  standalone: false,
  templateUrl: './replace-compressor.component.html',
  styleUrl: './replace-compressor.component.css'
})
export class ReplaceCompressorComponent {

  selectedModificationIdSub: Subscription;
  isFormChange: boolean = false;
  modification: Modification;
  orderOptions: Array<number>;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  settingsSub: Subscription;
  settings: Settings;
  increasedVolumeError: string;

  form: UntypedFormGroup
  currentCompressorMapping: Array<{
    originalCompressorId: string,
    isReplaced: boolean
  }>;
  replacementCompressorMapping: Array<{
    replacementCompressorId: string,
    isAdded: boolean
  }>;

  profileValidation: Array<ResultingSystemProfileValidation>;
  modificationResultsSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private replaceCompressorService: ReplaceCompressorService, private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirAssessmentService.settings.subscribe(settings => this.settings = settings);
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
        this.setData()
      } else {
        this.isFormChange = false;
      }
      this.setOrderOptions();
    });

    this.modificationResultsSub = this.compressedAirAssessmentService.compressedAirAssessmentModificationResults.subscribe(val => {
      this.profileValidation = val.modifiedDayTypeProfileSummaries.map(dayTypeModResult => { return dayTypeModResult.replaceCompressorProfileValidation });
      console.log(this.profileValidation);
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
    this.compressedAirAssessmentSub.unsubscribe();
    this.settingsSub.unsubscribe();
    this.modificationResultsSub.unsubscribe();
  }

  helpTextField(str: string) {
    this.compressedAirAssessmentService.helpTextField.next(str);
    this.compressedAirAssessmentService.focusedField.next('replaceCompressor');
  }

  setOrderOptions() {
    if (this.compressedAirAssessment && this.modification) {
      this.orderOptions = new Array();
      if (this.modification) {
        let allOrders: Array<number> = [
          this.modification.reduceAirLeaks.order,
          this.modification.adjustCascadingSetPoints.order,
          this.modification.improveEndUseEfficiency.order,
          this.modification.reduceRuntime.order,
          this.modification.reduceSystemAirPressure.order,
          this.modification.useAutomaticSequencer.order,
          this.modification.addPrimaryReceiverVolume.order
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
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.form.controls.order.value;
      this.modification = this.exploreOpportunitiesService.setOrdering(this.modification, 'replaceCompressor', this.modification.replaceCompressor.order, newOrder);
    }
    this.modification.replaceCompressor = this.replaceCompressorService.getObjFromForm(this.form, this.currentCompressorMapping, this.replacementCompressorMapping);
    this.compressedAirAssessmentService.updateModification(this.modification);
  }

  setData() {
    if (this.compressedAirAssessment && this.modification) {
      let replaceCompressor: ReplaceCompressor = this.modification.replaceCompressor;
      this.form = this.replaceCompressorService.getFormFromObj(replaceCompressor);
      this.currentCompressorMapping = replaceCompressor.currentCompressorMapping;
      this.replacementCompressorMapping = replaceCompressor.replacementCompressorMapping;
    }
  }

  setReplacement(compressorMap: { originalCompressorId: string, isReplaced: string }) {
    // let reduceRuntime: ReduceRuntime = this.modification.reduceRuntime;
    // reduceRuntime.runtimeData.forEach(runtimeData => {
    //   if (runtimeData.compressorId == compressorMap.originalCompressorId && compressorMap.replacementCompressorId) {
    //     let replacementCompressor: CompressorInventoryItem = this.compressedAirAssessment.replacementCompressorInventoryItems.find(item => { return item.itemId == compressorMap.replacementCompressorId });
    //     runtimeData.compressorId = replacementCompressor.itemId;
    //     runtimeData.fullLoadCapacity = replacementCompressor.performancePoints.fullLoad.airflow;
    //     runtimeData.automaticShutdownTimer = replacementCompressor.compressorControls.automaticShutdown;
    //     runtimeData.originalCompressorId = compressorMap.originalCompressorId;
    //   } else if (runtimeData.originalCompressorId == compressorMap.originalCompressorId && !compressorMap.replacementCompressorId) {
    //     let originalCompressor: CompressorInventoryItem = this.compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == compressorMap.originalCompressorId });
    //     runtimeData.compressorId = originalCompressor.itemId;
    //     runtimeData.fullLoadCapacity = originalCompressor.performancePoints.fullLoad.airflow;
    //     runtimeData.automaticShutdownTimer = originalCompressor.compressorControls.automaticShutdown;
    //   }
    // });
    this.save(false);
  }
}
