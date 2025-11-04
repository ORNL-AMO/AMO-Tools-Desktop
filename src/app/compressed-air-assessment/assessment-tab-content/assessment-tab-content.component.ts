import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { CompressedAirAssessment, Modification } from '../../shared/models/compressed-air-assessment';

@Component({
  selector: 'app-assessment-tab-content',
  standalone: false,
  templateUrl: './assessment-tab-content.component.html',
  styleUrl: './assessment-tab-content.component.css'
})
export class AssessmentTabContentComponent {

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private router: Router
  ) { }

  ngOnInit() {
    //baseline not setup, navigate back to start
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    if (!compressedAirAssessment || !compressedAirAssessment.setupDone) {
      let routerStr: string = this.router.url.replace(/\/assessment\/.*/, '')
      this.router.navigateByUrl(routerStr);
    } else {
      let selectedModification: Modification = this.compressedAirAssessmentService.selectedModification.getValue();
      if (!selectedModification) {
        //no modification selected, navigate to first modification if exists
        if (compressedAirAssessment.modifications && compressedAirAssessment.modifications.length != 0) {
          this.compressedAirAssessmentService.setSelectedModificationById(compressedAirAssessment.modifications[0].modificationId);
        }
      } else {
        //check modification exists in assessment
        let modExists: boolean = false;
        compressedAirAssessment.modifications.forEach(modification => {
          if (modification.modificationId == selectedModification.modificationId) {
            modExists = true;
          }
        });
        if (!modExists) {
          //modification no longer exists, navigate to first modification if exists
          if (compressedAirAssessment.modifications && compressedAirAssessment.modifications.length != 0) {
            this.compressedAirAssessmentService.setSelectedModificationById(compressedAirAssessment.modifications[0].modificationId);
          } else {
            this.compressedAirAssessmentService.selectedModification.next(undefined);
          }
        }
      }
    }
  }
}
