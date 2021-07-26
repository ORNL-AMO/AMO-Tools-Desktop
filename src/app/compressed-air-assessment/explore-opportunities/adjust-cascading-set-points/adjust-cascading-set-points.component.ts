import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdjustCascadingSetPoints, CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-adjust-cascading-set-points',
  templateUrl: './adjust-cascading-set-points.component.html',
  styleUrls: ['./adjust-cascading-set-points.component.css']
})
export class AdjustCascadingSetPointsComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  adjustCascadingSetPoints: AdjustCascadingSetPoints
  isFormChange: boolean = false;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.adjustCascadingSetPoints = compressedAirAssessment.modifications[modificationIndex].adjustCascadingSetPoints;
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

  setAdjustCascadingSetPoints() {
    this.save();
  }
  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
    compressedAirAssessment.modifications[modificationIndex].adjustCascadingSetPoints = this.adjustCascadingSetPoints;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }
}
