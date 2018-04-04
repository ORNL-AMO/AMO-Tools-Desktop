import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { PhastService } from '../phast.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Directory } from '../../shared/models/directory';
import { ReportRollupService } from '../../report-rollup/report-rollup.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { SettingsService } from '../../settings/settings.service';
import { PhastReportService } from './phast-report.service';
import { setTimeout } from 'timers';
import { ModalDirective } from 'ngx-bootstrap';

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
  @Input()
  quickReport: boolean;

  @ViewChild('reportTemplate') reportTemplate: TemplateRef<any>;

  @ViewChild('printMenuModal') public printMenuModal: ModalDirective;

  currentTab: string = 'energy-used';
  assessmentDirectories: Array<Directory>;
  createdDate: Date;
  showPrint: boolean = false;
  showPrintDiv: boolean = false;

  selectAll: boolean = false;
  // printFacilityInfo: boolean = false;
  printEnergyUsed: boolean = false;
  printExecutiveSummary: boolean = false;
  printResultsData: boolean = false;
  printReportGraphs: boolean = false;
  printReportSankey: boolean = false;
  printInputSummary: boolean = false;

  constructor(private phastService: PhastService, private indexedDbService: IndexedDbService, private phastReportService: PhastReportService, private reportRollupService: ReportRollupService, private windowRefService: WindowRefService, private settingsService: SettingsService) { }

  ngOnInit() {
    this.initPrintLogic();
    this.createdDate = new Date();
    if (this.settings) {
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

    //subscribe to print event
    this.phastReportService.showPrint.subscribe(printVal => {
      //shows loading print view
      this.showPrintDiv = printVal;
      if (printVal == true) {
        //use delay to show loading before print payload starts
        setTimeout(() => {
          this.showPrint = printVal;
        }, 20)
      } else {
        this.showPrint = printVal;
      }
    });
  }

  ngAfterViewInit() {
  }

  initPrintLogic() {
    if (this.inRollup) {
      // this.printFacilityInfo = true;
      this.printEnergyUsed = true;
      this.printExecutiveSummary = true;
      this.printResultsData = true;
      this.printReportGraphs = true;
      this.printReportSankey = true;
      this.printInputSummary = false;
    }
  }

  setTab(str: string): void {
    this.currentTab = str;
  }


  getSettings(): void {
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


  getParentDirectorySettings(dirId: number): void {
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

  getDirectoryList(id: number): void {
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


  showModal(): void {
    this.printMenuModal.show();
  }


  closeModal(reset: boolean): void {
    if (reset) {
      this.resetPrintSelection();
    }
    this.printMenuModal.hide();
  }

  resetPrintSelection() {
    this.selectAll = false;
    // this.printFacilityInfo = false;
    this.printEnergyUsed = false;
    this.printExecutiveSummary = false;
    this.printResultsData = false;
    this.printReportGraphs = false;
    this.printReportSankey = false;
    this.printInputSummary = false;
  }

  togglePrint(section: string): void {
    switch (section) {
      case "select-all": {
        this.selectAll = !this.selectAll;
        if (this.selectAll) {
          // this.printFacilityInfo = true;
          this.printEnergyUsed = true;
          this.printExecutiveSummary = true;
          this.printResultsData = true;
          this.printReportGraphs = true;
          this.printReportSankey = true;
          // this.printInputSummary = true;
        }
        else {
          // this.printFacilityInfo = false;
          this.printEnergyUsed = false;
          this.printExecutiveSummary = false;
          this.printResultsData = false;
          this.printReportGraphs = false;
          this.printReportSankey = false;
          // this.printInputSummary = false;
        }
        break;
      }
      // case "facility-info": {
      //   this.printFacilityInfo = !this.printFacilityInfo;
      //   break;
      // }
      case "energy-used": {
        this.printEnergyUsed = !this.printEnergyUsed;
        break;
      }
      case "executive-summary": {
        this.printExecutiveSummary = !this.printExecutiveSummary;
        break;
      }
      case "results-data": {
        this.printResultsData = !this.printResultsData;
        break;
      }
      case "report-graphs": {
        this.printReportGraphs = !this.printReportGraphs;
        break;
      }
      case "report-sankey": {
        this.printReportSankey = !this.printReportSankey;
        break;
      }
      case "input-summary": {
        this.printInputSummary = !this.printInputSummary;
        break;
      }
      default: {
        break;
      }
    }
  }


  print(): void {
    this.closeModal(false);
    //when print clicked set show print value to true
    this.phastReportService.showPrint.next(true);
    setTimeout(() => {
      let win = this.windowRefService.nativeWindow;
      let doc = this.windowRefService.getDoc();
      win.print();
      //after printing hide content again
      this.phastReportService.showPrint.next(false);
      this.resetPrintSelection();
    }, 2000);
  }
}