import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, Modification, ReplaceCompressor } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ReplaceCompressorService } from './replace-compressor.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { ResultingSystemProfileValidation } from '../../../../calculations/modifications/energyEfficiencyMeasures/ResultingSystemProfileValidation';
import { CompressedAirDataManagementService } from '../../../../compressed-air-data-management.service';

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
    private replaceCompressorService: ReplaceCompressorService, private exploreOpportunitiesService: ExploreOpportunitiesService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

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
      if (val) {
        this.profileValidation = val.modifiedDayTypeProfileSummaries.map(dayTypeModResult => { return dayTypeModResult.replaceCompressorProfileValidation });
      }
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
          // this.modification.useAutomaticSequencer.order,
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
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (isOrderChange) {
      this.isFormChange = false;
      let newOrder: number = this.form.controls.order.value;
      this.modification = this.exploreOpportunitiesService.setOrdering(this.modification, 'replaceCompressor', this.modification.replaceCompressor.order, newOrder);
      if (newOrder != 100) {
        if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer' || this.modification.useAutomaticSequencer.order != 100) {
          this.modification = this.exploreOpportunitiesService.setOrdering(this.modification, 'useAutomaticSequencer', this.modification.useAutomaticSequencer.order, newOrder + 1);
          this.modification.useAutomaticSequencer.order = newOrder + 1;
        }
      }
    }
    this.modification.replaceCompressor = this.replaceCompressorService.getObjFromForm(this.form, this.currentCompressorMapping, this.replacementCompressorMapping);
    //update other modifications that depend on replacement compressors
    this.modification = this.compressedAirDataManagementService.updateReplacementCompressors(this.modification, compressedAirAssessment);
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
}
