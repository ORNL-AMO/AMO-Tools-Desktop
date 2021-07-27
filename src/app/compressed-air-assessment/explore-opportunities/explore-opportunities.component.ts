import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, Modification } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { SystemProfileService } from '../system-profile/system-profile.service';
import { ExploreOpportunitiesService } from './explore-opportunities.service';

@Component({
  selector: 'app-explore-opportunities',
  templateUrl: './explore-opportunities.component.html',
  styleUrls: ['./explore-opportunities.component.css']
})
export class ExploreOpportunitiesComponent implements OnInit {
  @Input()
  containerHeight: number;
  @Output('exploreOppsToast')
  exploreOppsToast = new EventEmitter<boolean>();

  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment
  modificationExists: boolean;
  selectedModificationSub: Subscription;
  modification: Modification;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploerOpportunitiesService: ExploreOpportunitiesService,
    private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if (val) {
        this.compressedAirAssessment = val;
        this.modificationExists = (val.modifications && val.modifications.length != 0);
      }
    });

    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (!val && this.modificationExists) {
        this.compressedAirAssessmentService.selectedModificationId.next(this.compressedAirAssessment.modifications[0].modificationId);
      } else if (val && this.modificationExists) {
        this.modification = this.compressedAirAssessment.modifications.find(modification => { return modification.modificationId == val });
        if (!this.modification) {
          this.compressedAirAssessmentService.selectedModificationId.next(this.compressedAirAssessment.modifications[0].modificationId);
        }
      }
    })
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedModificationSub.unsubscribe();
  }

  addExploreOpp() {
    let newModification: Modification = this.exploerOpportunitiesService.getNewModification();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.modifications.push(newModification);
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.compressedAirAssessmentService.selectedModificationId.next(newModification.modificationId);
  }

  save() {
    this.exploerOpportunitiesService.saveModification(this.modification);
  }
}
