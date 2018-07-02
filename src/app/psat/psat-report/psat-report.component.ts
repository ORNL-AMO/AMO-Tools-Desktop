import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
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
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';

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
  @Input()
  containerHeight: number;

  @ViewChild('printMenuModal') public printMenuModal: ModalDirective;
  @ViewChild('reportBtns') reportBtns: ElementRef;
  @ViewChild('reportHeader') reportHeader: ElementRef;

  showPrint: boolean = false;
  showPrintDiv: boolean = false;
  selectAll: boolean = false;
  printReportGraphs: boolean;
  printReportSankey: boolean;
  printResults: boolean;
  printInputData: boolean;


  assessmentDirectories: Directory[];
  isFirstChange: boolean = true;
  numMods: number = 0;
  currentTab: string = 'results';
  createdDate: Date;
  reportContainerHeight: number;
  constructor(private psatService: PsatService, private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService, private windowRefService: WindowRefService, private settingsService: SettingsService, private psatReportService: PsatReportService) { }

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
  
  ngOnChanges(changes: SimpleChanges){
    if(changes.containerHeight && !changes.containerHeight.firstChange){
      this.getContainerHeight();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    },100)
  }

  getContainerHeight(){
    let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
    let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
    this.reportContainerHeight = this.containerHeight-btnHeight-headerHeight-25;
  }

  setTab(str: string) {
    this.currentTab = str;
  }

  getSettings() {
    //check for assessment settings
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment);
    if (this.settings) {
      if (!this.settings.temperatureMeasurement) {
        this.settings = this.settingsService.setTemperatureUnit(this.settings);
      }
    }
  }

  closeAssessment() {
    this.closeReport.emit(true);
  }

  getDirectoryList(id: number) {
    if (id && id != 1) {
      let results = this.directoryDbService.getById(id);
      this.assessmentDirectories.push(results);
      if (results.parentDirectoryId != 1) {
        this.getDirectoryList(results.parentDirectoryId);
      }
    }
  }

  exportToCsv() {
    this.exportData.emit(true);
  }

  useModification(event: any) {
    this.selectModification.emit(event);
  }


  initPrintLogic() {
    if (this.inRollup) {
      this.printReportGraphs = true;
      this.printReportSankey = true;
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
    this.printReportGraphs = false;
    this.printReportSankey = false;
    this.printResults = false;
    this.printInputData = false;
  }

  togglePrint(section: string): void {
    switch (section) {
      case "select-all": {
        this.selectAll = !this.selectAll;
        if (this.selectAll) {
          this.printReportGraphs = true;
          this.printReportSankey = true;
          this.printResults = true;
        }
        else {
          this.printReportGraphs = false;
          this.printReportSankey = false;
          this.printResults = false;
        }
        break;
      }
      case "reportGraphs": {
        this.printReportGraphs = !this.printReportGraphs;
        break;
      }
      case "reportSankey": {
        this.printReportSankey = !this.printReportSankey;
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
}
