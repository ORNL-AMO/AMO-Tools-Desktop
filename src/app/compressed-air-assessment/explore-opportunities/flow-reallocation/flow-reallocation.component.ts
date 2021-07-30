import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, FlowReallocation, Modification, ProfileSummary, ProfileSummaryTotal } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { SystemProfileService } from '../../system-profile/system-profile.service';

@Component({
  selector: 'app-flow-reallocation',
  templateUrl: './flow-reallocation.component.html',
  styleUrls: ['./flow-reallocation.component.css']
})
export class FlowReallocationComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  flowReallocation: FlowReallocation
  isFormChange: boolean = false;

  dayTypeResults: Array<{
    dayTypeName: string,
    baselineResults: { cost: number, power: number, peakDemand: number },
    adjustedResults: { cost: number, power: number, peakDemand: number },
    savings: { cost: number, power: number, peakDemand: number }
  }>
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        let selectedModification: Modification = compressedAirAssessment.modifications.find(mod => { return mod.modificationId == val });
        this.flowReallocation = selectedModification.flowReallocation;

        this.dayTypeResults = new Array();
        compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
          let adjustedProfileSummary: Array<ProfileSummary> = this.systemProfileService.flowReallocation(compressedAirAssessment, dayType, selectedModification, false);
          let calculatedSavings: {
            baselineResults: { cost: number, power: number, peakDemand: number },
            adjustedResults: { cost: number, power: number, peakDemand: number },
            savings: { cost: number, power: number, peakDemand: number }
          } = this.systemProfileService.calculateSavings(compressedAirAssessment.systemProfile.profileSummary, adjustedProfileSummary, dayType, compressedAirAssessment.systemBasics.electricityCost);
          this.dayTypeResults.push({
            dayTypeName: dayType.name,
            baselineResults: calculatedSavings.baselineResults,
            adjustedResults: calculatedSavings.adjustedResults,
            savings: calculatedSavings.savings
          })
        })
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
    compressedAirAssessment.modifications[modificationIndex].flowReallocation = this.flowReallocation;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }

  toggleFlowReallocation() {
    this.focusField('flowReallocation');
    this.flowReallocation.selected = !this.flowReallocation.selected;
    this.save();
  }

}
