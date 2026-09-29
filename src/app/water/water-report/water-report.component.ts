import { Component, DestroyRef, ElementRef, inject, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../../shared/models/assessment';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { WaterAssessmentService } from '../water-assessment.service';
import { WaterAssessmentResultsService } from '../water-assessment-results.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WaterReportAdapter, WATER_SECTION_GROUPS } from './water-report.adapter';
import { ReportDocument, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';

@Component({
  selector: 'app-water-report',
  standalone: false,
  templateUrl: './water-report.component.html',
  styleUrl: './water-report.component.css'
})
export class WaterReportComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly waterAssessmentResultsService = inject(WaterAssessmentResultsService);
  private readonly waterAssessmentService = inject(WaterAssessmentService);
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly directoryDbService = inject(DirectoryDbService);
  private readonly reportAdapter = inject(WaterReportAdapter);


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
  currentTab: WaterReportTab = 'executiveSummary';
  reportContainerHeight: number;
  settings: Settings;

  tabsCollapsed: boolean = true;
  isDiagramValid$ = this.waterAssessmentService.isDiagramValid$;

  reportDocument$: Observable<ReportDocument>;
  readonly sectionGroups: ReportSectionGroup[] = WATER_SECTION_GROUPS;

  ngOnInit(): void {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.createdDate = new Date();
    this.reportDocument$ = this.reportAdapter.buildDocument(this.assessment);
    if (this.assessment) {
      this.assessmentDirectories = new Array();
      this.getDirectoryList(this.assessment.directoryId);

      this.waterAssessmentResultsService.plantResults$.pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe((plantResults) => {
        if (plantResults) {
          this.waterAssessmentResultsService.setPlantResults(plantResults);
        }
      });
    }

    if (this.inRollup || this.quickReport) {
      this.waterAssessmentService.waterAssessment.next(this.assessment.water);
      this.waterAssessmentService.settings.next(this.settings);
    }
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

  setTab(str: WaterReportTab) {
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

export type WaterReportTab = "facilityInfo" | "executiveSummary" | "systemSummary" | "systemTrueCost"