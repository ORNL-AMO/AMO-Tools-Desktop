import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../models/assessment';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { FacilityInfo } from '../models/settings';
import { PhonePipe } from '../pipes/phone.pipe';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-facility-info-summary',
  templateUrl: './facility-info-summary.component.html',
  styleUrls: ['./facility-info-summary.component.css']
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
