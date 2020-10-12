import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SettingsService } from '../settings/settings.service';
import { Assessment } from '../shared/models/assessment';
import { Directory } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';

@Component({
  selector: 'app-waste-water',
  templateUrl: './waste-water.component.html',
  styleUrls: ['./waste-water.component.css']
})
export class WasteWaterComponent implements OnInit {

  assessment: Assessment;
  settings: Settings;
  constructor(private activatedRoute: ActivatedRoute, private indexedDbService: IndexedDbService,
    private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      });
    });
  }
}
