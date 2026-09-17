import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { WasteWaterAnalysisService } from '../waste-water-analysis/waste-water-analysis.service';
import { WasteWaterService } from '../waste-water.service';
import { ReportDocument, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { WASTE_WATER_SECTION_GROUPS, WasteWaterReportAdapter } from './waste-water-report.adapter';

@Component({
  selector: 'app-waste-water-report',
  templateUrl: './waste-water-report.component.html',
  styleUrls: ['./waste-water-report.component.css'],
  standalone: false
})
export class WasteWaterReportComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  inAssessment: boolean;
  @Input()
  containerHeight: number;
  @Input()
  inRollup: boolean;
  @Input()
  quickReport: boolean;

  @ViewChild('reportBtns', { static: false }) reportBtns: ElementRef;
  @ViewChild('reportHeader', { static: false }) reportHeader: ElementRef;

  createdDate: Date;
  assessmentDirectories: Directory[];
  currentTab: string = 'results';
  reportContainerHeight: number;
  settings: Settings;
  tabsCollapsed: boolean = true;
  reportDocument$: Observable<ReportDocument>;
  readonly sectionGroups: ReportSectionGroup[] = WASTE_WATER_SECTION_GROUPS;

  constructor(private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService, private wasteWaterService: WasteWaterService,
    private wasteWaterAnalysisService: WasteWaterAnalysisService, private reportAdapter: WasteWaterReportAdapter) { }

  ngOnInit(): void {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.createdDate = new Date();
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);
    }
    this.assessment.wasteWater.baselineData.valid = this.wasteWaterService.checkWasteWaterValid(this.assessment.wasteWater.baselineData.activatedSludgeData, this.assessment.wasteWater.baselineData.aeratorPerformanceData, this.assessment.wasteWater.baselineData.operations);
    this.assessment.wasteWater.setupDone = this.assessment.wasteWater.baselineData.valid.isValid;
    if (this.assessment.wasteWater.setupDone) {
      this.assessment.wasteWater.baselineData.outputs = this.wasteWaterService.calculateResults(this.assessment.wasteWater.baselineData.activatedSludgeData, this.assessment.wasteWater.baselineData.aeratorPerformanceData, this.assessment.wasteWater.baselineData.operations, this.assessment.wasteWater.baselineData.co2SavingsData, this.settings, true);
      this.assessment.wasteWater.modifications.forEach(mod => {
        mod.valid = this.wasteWaterService.checkWasteWaterValid(mod.activatedSludgeData, mod.aeratorPerformanceData, mod.operations);
        mod.outputs = this.wasteWaterService.calculateResults(mod.activatedSludgeData, mod.aeratorPerformanceData, mod.operations, mod.co2SavingsData, this.settings, true, this.assessment.wasteWater.baselineData.outputs);
      });
      this.wasteWaterAnalysisService.setResults(this.assessment.wasteWater, this.settings);
    }

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

  getDirectoryList(id: number) {
    if (id && id !== 1) {
      let results = this.directoryDbService.getById(id);
      this.assessmentDirectories.push(results);
      if (results.parentDirectoryId !== 1) {
        this.getDirectoryList(results.parentDirectoryId);
      }
    }
  }

  setTab(str: string) {
    this.currentTab = str;
    this.collapseTabs();
  }

  getContainerHeight() {
    if (this.reportBtns) {
      let btnHeight: number = this.reportBtns.nativeElement.clientHeight;
      let headerHeight: number = this.reportHeader.nativeElement.clientHeight;
      this.reportContainerHeight = this.containerHeight - btnHeight - headerHeight - 2;
    }
  }

  collapseTabs() {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}
