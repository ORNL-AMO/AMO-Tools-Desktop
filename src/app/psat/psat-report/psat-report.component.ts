import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PSAT, PsatInputs, PsatOutputs } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { Directory } from '../../shared/models/directory';
import { SettingsService } from '../../settings/settings.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';
import { Subscription } from 'rxjs';
import { PrintOptions } from '../../shared/models/printing';
import { PsatService } from '../psat.service';

@Component({
  selector: 'app-psat-report',
  templateUrl: './psat-report.component.html',
  styleUrls: ['./psat-report.component.css']
})
export class PsatReportComponent implements OnInit {

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
  currentTab: string = 'results';
  createdDate: Date;
  reportContainerHeight: number;
  printOptions: PrintOptions;
  constructor(private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService,
    private settingsService: SettingsService, private printOptionsMenuService: PrintOptionsMenuService,
    private psatService: PsatService) { }

  ngOnInit() {
    this.createdDate = new Date();
    if (!this.settings) {
      //find settings
      this.getSettings();
    }
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }
    if (!this.assessment.psat.modifications) {
      this.assessment.psat.modifications = new Array();
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
    });
    this.setOutputs();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
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


  setOutputs() {
    this.assessment.psat.outputs = this.getResults(this.assessment.psat, this.settings, true);
    this.assessment.psat.outputs.percent_annual_savings = 0;
    this.assessment.psat.modifications.forEach(modification => {
      modification.psat.outputs = this.getResults(modification.psat, this.settings, false);
      modification.psat.outputs.percent_annual_savings = this.getSavingsPercentage(this.assessment.psat, modification.psat);
    });
  }

  getResults(psat: PSAT, settings: Settings, isBaseline: boolean): PsatOutputs {
    let psatInputs: PsatInputs = JSON.parse(JSON.stringify(psat.inputs));
    let isPsatValid: boolean = this.psatService.isPsatValid(psatInputs, isBaseline);
    if (isPsatValid) {
      if (isBaseline) {
        return this.psatService.resultsExisting(JSON.parse(JSON.stringify(psat.inputs)), settings);
      } else {
        return this.psatService.resultsModified(JSON.parse(JSON.stringify(psat.inputs)), settings);
      }
    } else {
      return this.psatService.emptyResults();
    }
  }

  getSavingsPercentage(baseline: PSAT, modification: PSAT): number {
    let tmpSavingsPercent: number = Number(Math.round(((((baseline.outputs.annual_cost - modification.outputs.annual_cost) * 100) / baseline.outputs.annual_cost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }
}
