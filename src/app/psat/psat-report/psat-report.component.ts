import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PSAT, PsatInputs, PsatOutputs, PsatValid } from '../../shared/models/psat';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { Directory } from '../../shared/models/directory';
import { SettingsService } from '../../settings/settings.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { Observable } from 'rxjs';
import { PsatService } from '../psat.service';
import { ReportDocument, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { PsatReportAdapter, PSAT_SECTION_GROUPS } from './psat-report.adapter';

@Component({
    selector: 'app-psat-report',
    templateUrl: './psat-report.component.html',
    styleUrls: ['./psat-report.component.css'],
    standalone: false
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
  @Input()
  inRollup: boolean;
  @Input()
  quickReport: boolean;
  @Input()
  containerHeight: number;

  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;

  assessmentDirectories: Directory[];
  currentTab: string = 'results';
  createdDate: Date;
  reportContainerHeight: number;
  tabsCollapsed: boolean = true;
  reportDocument$: Observable<ReportDocument>;
  readonly sectionGroups: ReportSectionGroup[] = PSAT_SECTION_GROUPS;

  constructor(private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService,
    private settingsService: SettingsService,
    private psatService: PsatService, private reportAdapter: PsatReportAdapter) { }

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

    this.setOutputs();
    this.reportDocument$ = this.reportAdapter.buildDocument(this.assessment);
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


  getContainerHeight() {
    if (this.reportBtns && this.reportHeader) {
      let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
      let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
      this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 2;
    }
  }

  setTab(str: string) {
    this.currentTab = str;
    this.collapseTabs();
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
    psat.valid = this.psatService.isPsatValid(psatInputs, isBaseline);
    if (psat.valid.isValid) {
      if (isBaseline || !psat.inputs.whatIfScenario){
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

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}
