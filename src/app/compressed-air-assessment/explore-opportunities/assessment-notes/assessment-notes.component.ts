import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
    selector: 'app-assessment-notes',
    templateUrl: './assessment-notes.component.html',
    styleUrls: ['./assessment-notes.component.css'],
    standalone: false
})
export class AssessmentNotesComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  isFormChange: boolean = false;
  selectedModificationIndex: number;
  compressedAirAssessmentSub: Subscription;
  compressedAirAssessment: CompressedAirAssessment;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      if (compressedAirAssessment && !this.isFormChange) {
        this.compressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
      } else {
        this.isFormChange = false;
      }
    });

    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        this.selectedModificationIndex = this.compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy(){
    this.compressedAirAssessmentSub.unsubscribe();
    this.selectedModificationIdSub.unsubscribe();
  }

  save(){
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(this.compressedAirAssessment, false);
  }

}
