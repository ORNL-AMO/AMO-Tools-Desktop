import { Component } from '@angular/core';
import { ExploreOpportunitiesService } from '../explore-opportunities.service';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../../shared/models/compressed-air-assessment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-explore-opportunities-side-panel',
  standalone: false,
  templateUrl: './explore-opportunities-side-panel.component.html',
  styleUrl: './explore-opportunities-side-panel.component.css'
})
export class ExploreOpportunitiesSidePanelComponent {


  tabSelect: 'results' | 'compressor-profile' | 'help' | 'notes' = 'results';

  compressedAirAssessment: CompressedAirAssessment;
  selectedModificationSub: Subscription;
  modification: Modification;
  selectedDayTypeSub: Subscription;
  selectedDayType: CompressedAirDayType;
  dayTypeOptions: Array<CompressedAirDayType>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.selectedDayTypeSub = this.exploreOpportunitiesService.selectedDayType.subscribe(val => {
      this.selectedDayType = val;
    });

    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.dayTypeOptions = compressedAirAssessment.compressedAirDayTypes;

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      this.modification = val;
    });
  }

  ngOnDestroy() {
    this.selectedModificationSub.unsubscribe();
    this.selectedDayTypeSub.unsubscribe();
  }


  setTab(tab: 'results' | 'compressor-profile' | 'help' | 'notes') {
    this.tabSelect = tab;
  }

  changeDayType() {
    this.exploreOpportunitiesService.selectedDayType.next(this.selectedDayType);
  }

}
