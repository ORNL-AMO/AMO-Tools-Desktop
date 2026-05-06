import { Component, inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ProcessCoolingUiService, REPORT_VIEW_LINKS } from '../services/process-cooling-ui.service';
import { PROCESS_COOLING_SECTION_GROUPS, ProcessCoolingReportAdapter } from './process-cooling-report.adapter';
import { ReportDocument, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' }
})
export class ReportComponent implements OnInit {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  private readonly reportAdapter = inject(ProcessCoolingReportAdapter);

  @Input() assessment: Assessment;
  @Input() inAssessment: boolean;

  tabsCollapsed = true;
  createdDate: Date;
  reportDocument$: Observable<ReportDocument>;
  assessmentDirectories: any[] = [];
  REPORT_VIEW_LINKS = REPORT_VIEW_LINKS;
  readonly sectionGroups: ReportSectionGroup[] = PROCESS_COOLING_SECTION_GROUPS;

  ngOnInit(): void {
    this.processCoolingUiService.executiveSummaryViewSignal.set('report');
    this.processCoolingUiService.profileViewSignal.set('report');
    this.createdDate = new Date();
    this.reportDocument$ = this.reportAdapter.buildDocument(this.assessment);
  }

  collapseTabs(): void {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}
