import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../models/assessment';
import { FacilityInfo } from '../models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
    selector: 'app-facility-info-summary',
    templateUrl: './facility-info-summary.component.html',
    styleUrls: ['./facility-info-summary.component.css'],
    standalone: false
})
export class FacilityInfoSummaryComponent implements OnInit {
  @Input()
  assessment: Assessment;


  facilityInfo: FacilityInfo;
  constructor(private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    let settings = this.settingsDbService.getByDirectoryId(this.assessment.directoryId);
    if (settings) {
      if (settings.facilityInfo) {
        this.facilityInfo = settings.facilityInfo;
      }
    }
  }
}
