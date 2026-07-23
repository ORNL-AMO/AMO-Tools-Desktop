import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsService } from '../../settings/settings.service';
import { Observable } from 'rxjs';
import { FsatService } from '../fsat.service';
import { ReportDocument, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { FsatReportAdapter, FSAT_SECTION_GROUPS } from './fsat-report.adapter';

@Component({
  selector: 'app-fsat-report',
  templateUrl: './fsat-report.component.html',
  styleUrls: ['./fsat-report.component.css'],
  standalone: false
})
export class FsatReportComponent implements OnInit {
  @Output('closeReport')
  closeReport = new EventEmitter();
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  inFsat: boolean;
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

  selectAll: boolean = false;

  assessmentDirectories: Directory[];
  currentTab: string = 'results';
  createdDate: Date;
  reportContainerHeight: number;
  tabsCollapsed: boolean = true;
  reportDocument$: Observable<ReportDocument>;
  readonly sectionGroups: ReportSectionGroup[] = FSAT_SECTION_GROUPS;

  constructor(private fsatService: FsatService,
    private settingsDbService: SettingsDbService, private directoryDbService: DirectoryDbService,
    private settingsService: SettingsService, private reportAdapter: FsatReportAdapter) { }

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

    if (!this.assessment.fsat.modifications) {
      this.assessment.fsat.modifications = new Array();
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
    }, 100);
  }

  getContainerHeight() {
    let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
    let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
    this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 2;
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
    if (id && id !== 1) {
      let results = this.directoryDbService.getById(id);
      this.assessmentDirectories.push(results);
      if (results.parentDirectoryId !== 1) {
        this.getDirectoryList(results.parentDirectoryId);
      }
    }
  }

  useModification(event: any) {
    this.selectModification.emit(event);
  }

  setOutputs() {
    this.assessment.fsat.valid = this.fsatService.checkValid(this.assessment.fsat, true, this.settings);
    this.assessment.fsat.outputs = this.fsatService.getResults(this.assessment.fsat, true, this.settings);
    this.assessment.fsat.modifications.forEach(modification => {
      if (modification.fsat) {
        modification.fsat.valid = this.fsatService.checkValid(modification.fsat, false, this.settings);
        modification.fsat.outputs = this.fsatService.getResults(modification.fsat, false, this.settings);
        modification.fsat.outputs.percentSavings = this.fsatService.getSavingsPercentage(this.assessment.fsat.outputs.annualCost, modification.fsat.outputs.annualCost);
        modification.fsat.outputs.energySavings = this.assessment.fsat.outputs.annualEnergy - modification.fsat.outputs.annualEnergy;
        modification.fsat.outputs.annualSavings = this.assessment.fsat.outputs.annualCost - modification.fsat.outputs.annualCost;

      }
    }
    );
  }

  getSavingsPercentage(baseline: FSAT, modification: FSAT): number {
    let tmpSavingsPercent: number = Number(Math.round(((((baseline.outputs.annualCost - modification.outputs.annualCost) * 100) / baseline.outputs.annualCost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}
