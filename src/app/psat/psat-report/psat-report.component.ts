import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { Directory } from '../../shared/models/directory';
import { SettingsService } from '../../settings/settings.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import * as d3 from 'd3';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { Subscription } from 'rxjs';
import { PrintOptions } from '../../shared/models/printing';

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
  @Input()
  quickReport: boolean;
  @Input()
  containerHeight: number;

  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;

  showPrintView: boolean = false;
  showPrintViewSub: Subscription;
  showPrintMenu: boolean = false;
  showPrintMenuSub: Subscription;
  showPrintDiv: boolean = false;
  selectAll: boolean = false;


  assessmentDirectories: Directory[];
  isFirstChange: boolean = true;
  numMods: number = 0;
  currentTab: string = 'results';
  createdDate: Date;
  reportContainerHeight: number;
  printOptions: PrintOptions;
  constructor(private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService, private settingsService: SettingsService, private printOptionsMenuService: PrintOptionsMenuService) { }

  ngOnInit() {
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


    if (!this.inRollup) {
      this.showPrintMenuSub = this.printOptionsMenuService.showPrintMenu.subscribe(val => {
        this.showPrintMenu = val;
      });
    }

    this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printOptions = this.printOptionsMenuService.printOptions.getValue();
      this.showPrintDiv = val;
      if (val == true) {
        //use delay to show loading before print payload starts
        setTimeout(() => {
          this.showPrintView = val;
        }, 20)
      } else {
        this.showPrintView = val;
      }
    })

    // //subscribe to print event
    // this.psatReportService.showPrint.subscribe(printVal => {
    //   //shows loading print view
    //   this.showPrintDiv = printVal;
    //   if (printVal == true) {
    //     //use delay to show loading before print payload starts
    //     setTimeout(() => {
    //       this.showPrint = printVal;
    //     }, 20)
    //   } else {
    //     this.showPrint = printVal;
    //   }
    // });

    // if (this.printView !== undefined) {
    //   if (this.printView) {
    //     this.showPrint = true;
    //   }
    // }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
    // if (changes.printViewSelection && !changes.printViewSelection.firstChange) {
    //   this.initPrintLogic();
    // }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100)
  }

  ngOnDestroy() {
    if (this.showPrintMenuSub) {
      this.showPrintMenuSub.unsubscribe();
    }
    this.showPrintViewSub.unsubscribe();
  }

  getContainerHeight() {
    let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
    let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
    this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 25;
  }

  setTab(str: string) {
    this.currentTab = str;
    setTimeout(() => {
      d3.selectAll('.tick text').style('display', 'initial');
    }, 50);
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

  print() {
    this.printOptionsMenuService.printContext.next('psat');
    this.printOptionsMenuService.showPrintMenu.next(true);
  }
}
