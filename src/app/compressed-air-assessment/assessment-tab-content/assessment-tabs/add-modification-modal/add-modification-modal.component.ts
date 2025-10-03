import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CompressedAirAssessment, Modification } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities/explore-opportunities.service';

@Component({
    selector: 'app-add-modification-modal',
    templateUrl: './add-modification-modal.component.html',
    styleUrls: ['./add-modification-modal.component.css'],
    standalone: false
})
export class AddModificationModalComponent implements OnInit {

  @ViewChild('addNewModal', { static: false }) public addNewModal: ModalDirective;
  modificationExists: boolean;
  assessmentTab: string;
  newModificationName: string;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private exploreOpportunitiesServce: ExploreOpportunitiesService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentService.modalOpen.next(true);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.newModificationName = 'Scenario ' + (compressedAirAssessment.modifications.length + 1);
    this.modificationExists = (compressedAirAssessment.modifications && compressedAirAssessment.modifications.length != 0);
    this.assessmentTab = this.compressedAirAssessmentService.assessmentTab.getValue();
  }

  ngAfterViewInit() {
    this.addNewModal.show();
  }

  closeAddNewModal() {
    this.compressedAirAssessmentService.modalOpen.next(false);
    this.compressedAirAssessmentService.showAddModificationModal.next(false);
    this.addNewModal.hide();
  }

  addModification() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let modification: Modification = this.exploreOpportunitiesServce.getNewModification(compressedAirAssessment);
    modification.name = this.newModificationName? this.newModificationName : modification.name;
    compressedAirAssessment.modifications.push(modification);
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, false);
    this.compressedAirAssessmentService.selectedModification.next(modification);
    this.closeAddNewModal();
  }
}
