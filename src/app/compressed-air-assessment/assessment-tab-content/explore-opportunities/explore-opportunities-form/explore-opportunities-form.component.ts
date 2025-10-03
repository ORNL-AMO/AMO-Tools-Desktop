import { Component } from '@angular/core';
import { CompressorTypeOption, CompressorTypeOptions } from '../../../baseline-tab-content/inventory-setup/inventory/inventoryOptions';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../../shared/models/compressed-air-assessment';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-explore-opportunities-form',
  standalone: false,
  templateUrl: './explore-opportunities-form.component.html',
  styleUrl: './explore-opportunities-form.component.css'
})
export class ExploreOpportunitiesFormComponent {


  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment
  modificationExists: boolean;
  selectedModificationSub: Subscription;
  modification: Modification;
  dayTypeOptions: Array<CompressedAirDayType>;
  showCascadingSetPoints: boolean;
  hasSequencerOn: boolean;
  displayAddStorage: boolean;
  showCascadingAndSequencer: boolean;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.showCascadingAndSequencer = (this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'cascading' || this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer');
        this.showCascadingSetPoints = this.compressedAirAssessment.compressorInventoryItems.length > 1;
        this.modificationExists = (val.modifications && val.modifications.length != 0);
        this.setHasSequencer();
        this.setDisplayAddStorage();
      }
    });

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      this.modification = val;
      this.setHasSequencer();
    });
  }


  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedModificationSub.unsubscribe();
  }

  setHasSequencer() {
    if (this.compressedAirAssessment) {
      this.hasSequencerOn = this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer';
      if (!this.hasSequencerOn && this.modification) {
        this.hasSequencerOn = (this.modification.useAutomaticSequencer.order != 100)
      }
    }
  }

  addExploreOpp() {
    this.compressedAirAssessmentService.showAddModificationModal.next(true);
  }

  save() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let modIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == this.modification.modificationId });
    compressedAirAssessment.modifications[modIndex] = this.modification;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, false);
  }

  setDisplayAddStorage() {
    let displayAddStorage: boolean = false;
    this.compressedAirAssessment.compressorInventoryItems.forEach(item => {
      let compressorTypeOption: CompressorTypeOption = CompressorTypeOptions.find(option => { return option.value == item.nameplateData.compressorType });
      if (compressorTypeOption.lubricantTypeEnumValue == 0) {
        displayAddStorage = true;
      }
    });
    this.displayAddStorage = displayAddStorage;
  }

  focusedField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }


}
