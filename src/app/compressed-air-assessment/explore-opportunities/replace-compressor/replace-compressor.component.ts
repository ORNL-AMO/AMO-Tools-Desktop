import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, ReplaceCompressor } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { ReplaceCompressorService } from './replace-compressor.service';
import { ExploreOpportunitiesValidationService } from '../explore-opportunities-validation.service';

@Component({
  selector: 'app-replace-compressor',
  standalone: false,
  templateUrl: './replace-compressor.component.html',
  styleUrl: './replace-compressor.component.css'
})
export class ReplaceCompressorComponent {

  selectedModificationIdSub: Subscription;
  isFormChange: boolean = false;
  selectedModificationIndex: number;
  // orderOptions: Array<number>;
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
    private replaceCompressorService: ReplaceCompressorService, private exploreOpportunitiesValidationService: ExploreOpportunitiesValidationService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirAssessmentService.settings.subscribe(settings => this.settings = settings);
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        // this.setOrderOptions();
        this.setData()
      } else {
        this.isFormChange = false;
      }
    });

    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.setData()
      } else {
        this.isFormChange = false;
      }
      // this.setOrderOptions();
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

  // setOrderOptions() {
  //   if (this.compressedAirAssessment && this.selectedModificationIndex != undefined) {
  //     this.orderOptions = new Array();
  //     let modification: Modification = this.compressedAirAssessment.modifications[this.selectedModificationIndex];
  //     if (modification) {
  //       let allOrders: Array<number> = [
  //         modification.reduceAirLeaks.order,
  //         modification.adjustCascadingSetPoints.order,
  //         modification.improveEndUseEfficiency.order,
  //         modification.reduceRuntime.order,
  //         modification.reduceSystemAirPressure.order,
  //         modification.useAutomaticSequencer.order
  //       ];
  //       allOrders = allOrders.filter(order => { return order != 100 });
  //       let numOrdersOn: number = allOrders.length;
  //       for (let i = 1; i <= numOrdersOn + 1; i++) {
  //         this.orderOptions.push(i);
  //       }
  //     }
  //   }
  // }

  save(isOrderChange: boolean) {
    this.isFormChange = true;
    let previousOrder: number = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressor.order));
    console.log(this.replaceCompressorMapping);
    this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressor = this.replaceCompressorService.getObjFromForm(this.form, this.replaceCompressorMapping);
    
    // if (isOrderChange) {
    //   this.isFormChange = false;
    //   let newOrder: number = this.form.controls.order.value;
    //   this.compressedAirAssessment.modifications[this.selectedModificationIndex] = this.exploreOpportunitiesService.setOrdering(this.compressedAirAssessment.modifications[this.selectedModificationIndex], 'replaceCompressor', previousOrder, newOrder);
    // }
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
    // this.exploreOpportunitiesValidationService.addReceiverVolumeValid.next(this.form.valid);
  }

  setData() {
    if (this.compressedAirAssessment && this.selectedModificationIndex != undefined && this.compressedAirAssessment.modifications[this.selectedModificationIndex]) {
      let replaceCompressor: ReplaceCompressor = JSON.parse(JSON.stringify(this.compressedAirAssessment.modifications[this.selectedModificationIndex].replaceCompressor));
      this.form = this.replaceCompressorService.getFormFromObj(replaceCompressor);
      this.replaceCompressorMapping = replaceCompressor.compressorsMapping;
      if(!this.replaceCompressorMapping || this.replaceCompressorMapping.length == 0){
        console.log('setting mapping');
        this.replaceCompressorMapping = this.compressedAirAssessment.compressorInventoryItems.map(item => {
          return {
            originalCompressorId: item.itemId,
            replacementCompressorId: undefined
          }
        });
        this.save(false);
      }
      // if (replaceCompressor.order != 100) {
      //   this.exploreOpportunitiesValidationService.replaceCompressorValid.next(this.form.valid);
      // }
    }
  }
}
