import { Component } from '@angular/core';
import { CompressorTypeOption, CompressorTypeOptions } from '../../../baseline-tab-content/inventory-setup/inventory/inventoryOptions';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-explore-opportunities-form',
  standalone: false,
  templateUrl: './explore-opportunities-form.component.html',
  styleUrl: './explore-opportunities-form.component.css'
})
export class ExploreOpportunitiesFormComponent {

  compressedAirAssessment: CompressedAirAssessment
  modificationExists: boolean;
  selectedModificationSub: Subscription;
  modification: Modification;
  dayTypeOptions: Array<CompressedAirDayType>;
  showCascadingSetPoints: boolean;
  hasSequencerOn: boolean;
  displayAddStorage: boolean;
  showCascadingAndSequencer: boolean;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.showCascadingAndSequencer = (this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'cascading' || this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer');
    this.showCascadingSetPoints = this.compressedAirAssessment.compressorInventoryItems.length > 1;
    this.modificationExists = (this.compressedAirAssessment.modifications && this.compressedAirAssessment.modifications.length != 0);
    this.setDisplayAddStorage();

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      this.modification = val;
      this.setHasSequencer();
    });
  }


  ngOnDestroy() {
    this.selectedModificationSub.unsubscribe();
  }

  setHasSequencer() {
    this.hasSequencerOn = this.compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer';
    if (!this.hasSequencerOn && this.modification) {
      this.hasSequencerOn = (this.modification.useAutomaticSequencer.order != 100)
    }
  }

  addExploreOpp() {
    this.compressedAirAssessmentService.showAddModificationModal.next(true);
  }

  save() {
    this.compressedAirAssessmentService.updateModification(this.modification);
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
