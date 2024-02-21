import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportExportService } from '../../shared/import-export/import-export.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {
  measurItemType: 'page' | 'assessment' | 'inventory' = 'page';
  constructor(
    private activatedRoute: ActivatedRoute,
    private importExportService: ImportExportService,
    // private indexedDbService: IndexedDbService, 
    // private settingsDbService: SettingsDbService
    ) { }

  ngOnInit(): void {
    // this.settingsDbService.globalSettings.disableSurveyMonkey = true;
    // this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
      //   this.settingsDbService.setAll();
      // });
      this.activatedRoute.queryParams.subscribe(qp => {
         if (qp['measurItemType']) {
          this.measurItemType = qp['measurItemType'];
         }
      });
  }

  ngOnDestroy() {
    // this.settingsDbService.globalSettings.disableSurveyMonkey = false;
    // this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
    //   this.settingsDbService.setAll();
    // });
  }

  sendMail() {
    this.importExportService.openMailTo();
  }

}

