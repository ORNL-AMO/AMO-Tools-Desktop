import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsService } from '../../settings/settings.service';
import * as d3 from 'd3';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { Subscription } from 'rxjs';
import { PrintOptions } from '../../shared/models/printing';

@Component({
  selector: 'app-fsat-report',
  templateUrl: './fsat-report.component.html',
  styleUrls: ['./fsat-report.component.css']
})
export class FsatReportComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Output('closeReport')
  closeReport = new EventEmitter();
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inFsat: boolean;
  @Output('exportData')
  exportData = new EventEmitter<boolean>();
  @Input()
  inRollup: boolean;
  @Output('selectModification')
  selectModification = new EventEmitter<any>();
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
  constructor(private printOptionsMenuService: PrintOptionsMenuService, private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService, private settingsService: SettingsService) { }

  ngOnInit() {
    this.createdDate = new Date();
    if (this.assessment.fsat && this.settings && !this.fsat) {
      this.fsat = this.assessment.fsat;
    }
    else if (this.assessment.fsat && !this.settings) {
      this.fsat = this.assessment.fsat;
      //find settings
      this.getSettings();
    }
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }

    if (this.fsat.modifications) {
      this.numMods = this.fsat.modifications.length;
    } else {
      this.fsat.modifications = new Array();
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
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
    if (id && id !== 1) {
      let results = this.directoryDbService.getById(id);
      this.assessmentDirectories.push(results);
      if (results.parentDirectoryId !== 1) {
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

  print() {
    this.printOptionsMenuService.printContext.next('fsat');
    this.printOptionsMenuService.showPrintMenu.next(true);
  }
}
