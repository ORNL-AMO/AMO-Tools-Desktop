import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem, Modification, ReduceRuntime, ReplaceCompressor } from '../../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';
import { ReplaceCompressorService } from './replace-compressor.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';

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
  replaceCompressorMapping: Array<{
    originalCompressorId: string,
    replacementCompressorId: string
  }>;
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
        this.modification = val;;
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
    this.settingsSub.unsubscribe();
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
    // let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressor.order));
    // this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressor = this.replaceCompressorService.getObjFromForm(this.form, this.replaceCompressorMapping);

    // if (isOrderChange) {
    //   this.isFormChange = false;
    //   let newOrder: number = this.form.controls.order.value;
    //   this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'replaceCompressor', previousOrder, newOrder);
    // }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    // this.exploreOpportunitiesValidationService.addReceiverVolumeValid.next(this.form.valid);
  }

  setData() {
    if (this.compressedAirAssessment && this.modification) {
      let replaceCompressor: ReplaceCompressor = this.modification.replaceCompressor;
      this.form = this.replaceCompressorService.getFormFromObj(replaceCompressor);
      this.replaceCompressorMapping = replaceCompressor.compressorsMapping;
      // if (replaceCompressor.order != 100) {
      //   this.exploreOpportunitiesValidationService.replaceCompressorValid.next(this.form.valid);
      // }
    }
  }

  setReplacement(compressorMap: { originalCompressorId: string, replacementCompressorId: string }) {
    let reduceRuntime: ReduceRuntime = this.modification.reduceRuntime;
    reduceRuntime.runtimeData.forEach(runtimeData => {
      if (runtimeData.compressorId == compressorMap.originalCompressorId && compressorMap.replacementCompressorId) {
        let replacementCompressor: CompressorInventoryItem = this.compressedAirAssessment.replacementCompressorInventoryItems.find(item => { return item.itemId == compressorMap.replacementCompressorId });
        runtimeData.compressorId = replacementCompressor.itemId;
        runtimeData.fullLoadCapacity = replacementCompressor.performancePoints.fullLoad.airflow;
        runtimeData.automaticShutdownTimer = replacementCompressor.compressorControls.automaticShutdown;
        runtimeData.originalCompressorId = compressorMap.originalCompressorId;
      } else if (runtimeData.originalCompressorId == compressorMap.originalCompressorId && !compressorMap.replacementCompressorId) {
        let originalCompressor: CompressorInventoryItem = this.compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == compressorMap.originalCompressorId });
        runtimeData.compressorId = originalCompressor.itemId;
        runtimeData.fullLoadCapacity = originalCompressor.performancePoints.fullLoad.airflow;
        runtimeData.automaticShutdownTimer = originalCompressor.compressorControls.automaticShutdown;
      }
    });
    this.save(false);
  }
}
