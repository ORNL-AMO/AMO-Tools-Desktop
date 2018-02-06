import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../models/assessment';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { FacilityInfo } from '../models/settings';

@Component({
  selector: 'app-facility-info-summary',
  templateUrl: './facility-info-summary.component.html',
  styleUrls: ['./facility-info-summary.component.css']
})
export class FacilityInfoSummaryComponent implements OnInit {
  @Input()
  assessment: Assessment;


  facilityInfo: FacilityInfo;
  constructor(private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.indexedDbService.getDirectorySettings(this.assessment.directoryId).then(val => {
      if(val){
        let settings = val[0];
        if(settings.facilityInfo){
          this.facilityInfo = settings.facilityInfo;
        }
      }
    })
  }

}
