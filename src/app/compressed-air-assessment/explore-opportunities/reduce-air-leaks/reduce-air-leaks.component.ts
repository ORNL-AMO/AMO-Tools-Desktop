import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, ReduceAirLeaks } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-reduce-air-leaks',
  templateUrl: './reduce-air-leaks.component.html',
  styleUrls: ['./reduce-air-leaks.component.css']
})
export class ReduceAirLeaksComponent implements OnInit {
  
  selectedModificationIdSub: Subscription;
  reduceAirLeaks: ReduceAirLeaks;
  isFormChange: boolean = false;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.reduceAirLeaks = compressedAirAssessment.modifications[modificationIndex].reduceAirLeaks;
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
  setReduceAirLeaks() {
    this.save();
  }

  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
    compressedAirAssessment.modifications[modificationIndex].reduceAirLeaks = this.reduceAirLeaks;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }
}
