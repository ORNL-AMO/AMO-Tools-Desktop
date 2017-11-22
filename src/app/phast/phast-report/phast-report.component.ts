import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../phast.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Directory } from '../../shared/models/directory';
import { ReportRollupService } from '../../report-rollup/report-rollup.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-phast-report',
  templateUrl: './phast-report.component.html',
  styleUrls: ['./phast-report.component.css']
})
export class PhastReportComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  inRollup: boolean;

  currentTab: string = 'energy-used';
  assessmentDirectories: Array<Directory>;
  createdDate: Date;
  constructor(private phastService: PhastService, private indexedDbService: IndexedDbService, private reportRollupService: ReportRollupService, private windowRefService: WindowRefService, private settingsService: SettingsService) { }

  ngOnInit() {
    this.createdDate = new Date();
    if(this.settings){
      if (!this.settings.energyResultUnit) {
        this.settings = this.settingsService.setEnergyResultUnitSetting(this.settings);
      }
    }
    if (this.assessment.phast && this.settings && !this.phast) {
      this.phast = this.assessment.phast;
    } else if (this.assessment.phast && !this.settings) {
      this.getSettings();
    }

    if (this.assessment) {
      this.assessmentDirectories = new Array<Directory>();
      this.getDirectoryList(this.assessment.directoryId);
    }
    if (!this.inPhast) {
      this.currentTab = 'executive-summary';
    }

    if (!this.phast.operatingHours.hoursPerYear) {
      this.phast.operatingHours.hoursPerYear = 8736;
    }
  }

  setTab(str: string) {
    this.currentTab = str;
  }


  getSettings() {
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(results => {
      if (results.length != 0) {
        if (!results[0].energyResultUnit) {
          results[0] = this.settingsService.setEnergyResultUnitSetting(results[0]);
        }
        this.settings = results[0];
      } else {
        this.getParentDirectorySettings(this.assessment.directoryId);
      }
    })
  }


  getParentDirectorySettings(dirId: number) {
    this.indexedDbService.getDirectorySettings(dirId).then(
      resultSettings => {
        if (resultSettings.length != 0) {
          if (resultSettings[0].energyResultUnit) {
            resultSettings[0] = this.settingsService.setEnergyResultUnitSetting(resultSettings[0]);
          }
          this.settings = resultSettings[0];
        } else {
          this.indexedDbService.getDirectory(dirId).then(
            results => {
              let parentDirectory = results;
              //get parent directory settings
              this.getParentDirectorySettings(parentDirectory.parentDirectoryId);
            })
        }
      })
  }

  getDirectoryList(id: number) {
    if (id && id != 1) {
      this.indexedDbService.getDirectory(id).then(
        results => {
          this.assessmentDirectories.push(results);
          if (results.parentDirectoryId != 1) {
            this.getDirectoryList(results.parentDirectoryId);
          }
        }
      )
    }
  }

  print() {
    let win = this.windowRefService.nativeWindow;
    let doc = this.windowRefService.getDoc();
    win.print();
  }
}
