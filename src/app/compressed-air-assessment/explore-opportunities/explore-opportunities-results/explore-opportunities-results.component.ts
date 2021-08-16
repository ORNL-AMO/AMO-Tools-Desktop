import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, Modification, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { EemSavingsResults, SystemProfileService } from '../../system-profile/system-profile.service';

@Component({
  selector: 'app-explore-opportunities-results',
  templateUrl: './explore-opportunities-results.component.html',
  styleUrls: ['./explore-opportunities-results.component.css']
})
export class ExploreOpportunitiesResultsComponent implements OnInit {
  compressedAirAssessmentSub: Subscription;
  adjustedProfileSummary: Array<ProfileSummary>;
  totals: Array<ProfileSummaryTotal>;
  selectedDayType: CompressedAirDayType;
  dayTypeOptions: Array<CompressedAirDayType>;
  compressedAirAssessment: CompressedAirAssessment;
  totalSavings: EemSavingsResults;
  receiverVolumeSavings: EemSavingsResults;
  endUseEfficiencySavings: EemSavingsResults;
  reduceAirLeaksSavings: EemSavingsResults;
  reduceRunTimeSavings: EemSavingsResults;
  unloadingControlsSavings: EemSavingsResults;
  automaticSequencerSavings: EemSavingsResults;
  reduceSystemAirPressureSavings: EemSavingsResults;
  flowReallocationSavings: EemSavingsResults;
  modification: Modification;

  calculating: any;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.dayTypeOptions = this.compressedAirAssessment.compressedAirDayTypes;
        if (!this.selectedDayType) {
          this.selectedDayType = this.dayTypeOptions[0];
        }
        this.calculateProfile();
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  calculateProfile() {
    if(this.calculating){
      clearTimeout(this.calculating);
    }
    this.calculating = setTimeout(() => {
      let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
      this.modification = this.compressedAirAssessment.modifications.find(mod => { return mod.modificationId == selectedModificationId });
      this.adjustedProfileSummary = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, this.modification, true);
      this.totals = this.systemProfileService.calculateProfileSummaryTotals(this.compressedAirAssessment, this.selectedDayType, this.adjustedProfileSummary);
      this.totalSavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, this.adjustedProfileSummary, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
  
      let modificationCopy: Modification = JSON.parse(JSON.stringify(this.modification));
  
  
      modificationCopy.addPrimaryReceiverVolume.selected = false;
      modificationCopy.adjustCascadingSetPoints.selected = false;
      modificationCopy.improveEndUseEfficiency.selected = false;
      modificationCopy.reduceAirLeaks.selected = false;
      modificationCopy.reduceRuntime.selected = false;
      modificationCopy.reduceSystemAirPressure.selected = false;
      modificationCopy.useAutomaticSequencer.selected = false;
      modificationCopy.useUnloadingControls.selected = false;
      let tmpProfile: Array<ProfileSummary> = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modificationCopy, true);
      this.flowReallocationSavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, tmpProfile, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
  
      if (this.modification.addPrimaryReceiverVolume.selected) {
        modificationCopy.addPrimaryReceiverVolume.selected = true;
        modificationCopy.adjustCascadingSetPoints.selected = false;
        modificationCopy.improveEndUseEfficiency.selected = false;
        modificationCopy.reduceAirLeaks.selected = false;
        modificationCopy.reduceRuntime.selected = false;
        modificationCopy.reduceSystemAirPressure.selected = false;
        modificationCopy.useAutomaticSequencer.selected = false;
        modificationCopy.useUnloadingControls.selected = false;
        let tmpProfile: Array<ProfileSummary> = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modificationCopy, true);
        this.receiverVolumeSavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, tmpProfile, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
      }
  
      //not implemented
      // if(modificationCopy.adjustCascadingSetPoints.selected){
      //   modificationCopy.addPrimaryReceiverVolume.selected = false;
      //   modificationCopy.improveEndUseEfficiency.selected = false;
      //   modificationCopy.reduceAirLeaks.selected = false;
      //   modificationCopy.reduceRuntime.selected = false;
      //   modificationCopy.reduceSystemAirPressure.selected = false;
      //   modificationCopy.useAutomaticSequencer.selected = false;
      //   modificationCopy.useUnloadingControls.selected = false;
      //   let tmpProfile: Array<ProfileSummary> = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modificationCopy, true);
      //   this.receiverVolumeSavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, tmpProfile, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
      // }
  
      if (this.modification.improveEndUseEfficiency.selected) {
        modificationCopy.improveEndUseEfficiency.selected = true;
        modificationCopy.adjustCascadingSetPoints.selected = false;
        modificationCopy.addPrimaryReceiverVolume.selected = false;
        modificationCopy.reduceAirLeaks.selected = false;
        modificationCopy.reduceRuntime.selected = false;
        modificationCopy.reduceSystemAirPressure.selected = false;
        modificationCopy.useAutomaticSequencer.selected = false;
        modificationCopy.useUnloadingControls.selected = false;
        let tmpProfile: Array<ProfileSummary> = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modificationCopy, true);
        this.endUseEfficiencySavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, tmpProfile, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
      }
  
      if (this.modification.reduceAirLeaks.selected) {
        modificationCopy.reduceAirLeaks.selected = true;
        modificationCopy.adjustCascadingSetPoints.selected = false;
        modificationCopy.addPrimaryReceiverVolume.selected = false;
        modificationCopy.improveEndUseEfficiency.selected = false;
        modificationCopy.reduceRuntime.selected = false;
        modificationCopy.reduceSystemAirPressure.selected = false;
        modificationCopy.useAutomaticSequencer.selected = false;
        modificationCopy.useUnloadingControls.selected = false;
        let tmpProfile: Array<ProfileSummary> = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modificationCopy, true);
        this.reduceAirLeaksSavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, tmpProfile, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
      }
  
  
      if (this.modification.reduceRuntime.selected) {
        modificationCopy.reduceRuntime.selected = true;
        modificationCopy.adjustCascadingSetPoints.selected = false;
        modificationCopy.addPrimaryReceiverVolume.selected = false;
        modificationCopy.improveEndUseEfficiency.selected = false;
        modificationCopy.reduceAirLeaks.selected = false;
        modificationCopy.reduceSystemAirPressure.selected = false;
        modificationCopy.useAutomaticSequencer.selected = false;
        modificationCopy.useUnloadingControls.selected = false;
        let tmpProfile: Array<ProfileSummary> = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modificationCopy, true);
        this.reduceRunTimeSavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, tmpProfile, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
      }
  
      if (this.modification.reduceSystemAirPressure.selected) {
        modificationCopy.reduceSystemAirPressure.selected = true;
        modificationCopy.adjustCascadingSetPoints.selected = false;
        modificationCopy.addPrimaryReceiverVolume.selected = false;
        modificationCopy.improveEndUseEfficiency.selected = false;
        modificationCopy.reduceAirLeaks.selected = false;
        modificationCopy.reduceRuntime.selected = false;
        modificationCopy.useAutomaticSequencer.selected = false;
        modificationCopy.useUnloadingControls.selected = false;
        let tmpProfile: Array<ProfileSummary> = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modificationCopy, true);
        this.reduceSystemAirPressureSavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, tmpProfile, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
      }
  
      //not implemented
      // if(modification.useAutomaticSequencer.selected){
      //   modificationCopy.adjustCascadingSetPoints.selected = false;
      //   modificationCopy.addPrimaryReceiverVolume.selected = false;
      //   modificationCopy.improveEndUseEfficiency.selected = false;
      //   modificationCopy.reduceAirLeaks.selected = false;
      //   modificationCopy.reduceRuntime.selected = false;
      //   modificationCopy.reduceSystemAirPressure.selected = false;
      //   modificationCopy.useUnloadingControls.selected = false;
      //   let tmpProfile: Array<ProfileSummary> = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modificationCopy, true);
      //   this.reduceSystemAirPressureSavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, tmpProfile, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
      // }
  
  
      if (this.modification.useUnloadingControls.selected) {
        modificationCopy.useUnloadingControls.selected = true;
        modificationCopy.adjustCascadingSetPoints.selected = false;
        modificationCopy.addPrimaryReceiverVolume.selected = false;
        modificationCopy.improveEndUseEfficiency.selected = false;
        modificationCopy.reduceAirLeaks.selected = false;
        modificationCopy.reduceRuntime.selected = false;
        modificationCopy.reduceSystemAirPressure.selected = false;
        modificationCopy.useAutomaticSequencer.selected = false;
        let tmpProfile: Array<ProfileSummary> = this.systemProfileService.flowReallocation(this.compressedAirAssessment, this.selectedDayType, modificationCopy, true);
        this.unloadingControlsSavings = this.systemProfileService.calculateSavings(this.compressedAirAssessment.systemProfile.profileSummary, tmpProfile, this.selectedDayType, this.compressedAirAssessment.systemBasics.electricityCost);
      }
      this.calculating = undefined;
    }, 750);   
  }

}

