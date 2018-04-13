import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { Directory } from '../../shared/models/directory';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { SettingsService } from '../../settings/settings.service';
import { ModalDirective } from 'ngx-bootstrap';
import { PsatReportService } from './psat-report.service';

@Component({
  selector: 'app-psat-report',
  templateUrl: './psat-report.component.html',
  styleUrls: ['./psat-report.component.css']
})
export class PsatReportComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('closeReport')
  closeReport = new EventEmitter();
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inPsat: boolean;
  @Output('exportData')
  exportData = new EventEmitter<boolean>();
  @Input()
  inRollup: boolean;
  @Output('selectModification')
  selectModification = new EventEmitter<any>();
  @Input()
  quickReport: boolean;
  @Input()
  printView: boolean;

  @ViewChild('printMenuModal') public printMenuModal: ModalDirective;


  showPrint: boolean = false;
  showPrintDiv: boolean = false;
  selectAll: boolean = false;
  printResults: boolean;
  printInputData: boolean;


  assessmentDirectories: Directory[];
  isFirstChange: boolean = true;
  numMods: number = 0;
  currentTab: string = 'results';
  createdDate: Date;

  constructor(private psatService: PsatService, private indexedDbService: IndexedDbService, private windowRefService: WindowRefService, private settingsService: SettingsService, private psatReportService: PsatReportService) { }

  ngOnInit() {
    this.initPrintLogic();
    this.createdDate = new Date();
    if (this.assessment.psat && this.settings && !this.psat) {
      this.psat = this.assessment.psat;
    }
    else if (this.assessment.psat && !this.settings) {
      this.psat = this.assessment.psat;
      //find settings
      this.getSettings();
    }
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }

    if (this.psat.modifications) {
      this.numMods = this.psat.modifications.length;
    } else {
      this.psat.modifications = new Array();
    }

    //subscribe to print event
    this.psatReportService.showPrint.subscribe(printVal => {
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

    if (this.printView !== undefined) {
      if (this.printView) {
        this.showPrint = true;
      }
    }
  }

  setTab(str: string) {
    this.currentTab = str;
  }

  getSettings() {
    //check for assessment settings
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          if (!this.settings.temperatureMeasurement) {
            this.settings = this.settingsService.setTemperatureUnit(this.settings);
          }
        }
      }
    )
  }

  closeAssessment() {
    this.closeReport.emit(true);
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

  exportToCsv() {
    this.exportData.emit(true);
  }

  useModification(event: any) {
    this.selectModification.emit(event);
  }


  initPrintLogic() {
    console.log('initPrintLogic()');
    console.log('this.inRollup ' + this.inRollup);
    if (this.inRollup) {
      this.printResults = true;
      this.printInputData = true;
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
    this.printResults = false;
    this.printInputData = false;
  }

  togglePrint(section: string): void {
    switch (section) {
      case "select-all": {
        this.selectAll = !this.selectAll;
        if (this.selectAll) {
          this.printResults = true;
          this.printInputData = true;
        }
        else {
          this.printResults = false;
          this.printInputData = false;
        }
        break;
      }
      case "results": {
        this.printResults = !this.printResults;
        break;
      }
      case "inputData": {
        this.printInputData = !this.printInputData;
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
    this.psatReportService.showPrint.next(true);
    setTimeout(() => {
      let win = this.windowRefService.nativeWindow;
      let doc = this.windowRefService.getDoc();
      win.print();
      //after printing hide content again
      this.psatReportService.showPrint.next(false);
      this.resetPrintSelection();
    }, 2000);
  }


  // print() {
  //   this.showPrint = true;
  //   this.closeModal(false);
  //   setTimeout(() => {
  //     let win = this.windowRefService.nativeWindow;
  //     let doc = this.windowRefService.getDoc();
  //     win.print();

  //     this.showPrint = false;
  //   }, 1000);
  // }
}
