import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirDayType, ProfileSummary, ProfileSummaryData } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { SystemProfileService } from '../system-profile.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-system-profile-summary',
  templateUrl: './system-profile-summary.component.html',
  styleUrls: ['./system-profile-summary.component.css']
})
export class SystemProfileSummaryComponent implements OnInit {

  compressedAirAssessmentSub: Subscription;
  profileSummary: Array<ProfileSummary>;
  totals: Array<{
    airflow: number;
    power: number;
    percentCapacity: number;
    percentPower: number;
  }>;
  constructor(private systemProfileService: SystemProfileService, private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      this.profileSummary = this.systemProfileService.calculateDayTypeProfileSummary(val);
      let selectedDayType: CompressedAirDayType = val.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId == val.systemProfile.systemProfileSetup.dayTypeId });
      this.totals = this.systemProfileService.calculateProfileSummaryTotals(val, selectedDayType);
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }
}
