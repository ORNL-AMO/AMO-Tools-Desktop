import { Component, OnInit } from '@angular/core';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { SystemProfileService } from '../system-profile.service';

@Component({
  selector: 'app-system-profile-setup',
  templateUrl: './system-profile-setup.component.html',
  styleUrls: ['./system-profile-setup.component.css']
})
export class SystemProfileSetupComponent implements OnInit {

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.calculateDayTypeProfileSummary(compressedAirAssessment);
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }

}
