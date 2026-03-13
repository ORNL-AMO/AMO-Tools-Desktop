import { Component, Input, OnInit } from '@angular/core';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';

@Component({
  selector: 'app-performance-profiles',
  templateUrl: './performance-profiles.component.html',
  styleUrls: ['./performance-profiles.component.css'],
  standalone: false
})
export class PerformanceProfilesComponent implements OnInit {
  @Input()
  inReport: boolean;
  @Input()
  printView: boolean;
  @Input()
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  settings: Settings;
  @Input()
  assessmentResults: Array<CompressedAirAssessmentModificationResults>

  selectedModification: Modification;
  selectedModificationResults: CompressedAirAssessmentModificationResults;
  constructor() { }

  ngOnInit(): void {
    this.selectedModification = this.assessmentResults[0]?.modification;
    this.setSelectedModification();
  }

  setSelectedModification() {
    if (this.selectedModification) {
      this.selectedModificationResults = this.assessmentResults.find(result => { return result.modification.modificationId == this.selectedModification.modificationId });
    } else {
      this.selectedModificationResults = undefined;
    }
  }
}
