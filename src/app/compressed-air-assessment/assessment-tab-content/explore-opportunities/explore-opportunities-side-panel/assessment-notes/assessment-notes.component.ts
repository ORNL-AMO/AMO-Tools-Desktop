import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Modification } from '../../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';

@Component({
    selector: 'app-assessment-notes',
    templateUrl: './assessment-notes.component.html',
    styleUrls: ['./assessment-notes.component.css'],
    standalone: false
})
export class AssessmentNotesComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  isFormChange: boolean = false;
  modification: Modification;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      if (val && !this.isFormChange) {
        this.modification = val;
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy(){
    this.selectedModificationIdSub.unsubscribe();
  }

  save(){
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateModification(this.modification);
  }

}
