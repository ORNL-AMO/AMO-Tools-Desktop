import { Component, inject, input } from '@angular/core';
import { Observable, filter, switchMap } from 'rxjs';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { REPORT_VIEW_LINKS } from '../models/views';
import { PROCESS_COOLING_SECTION_GROUPS, ProcessCoolingReportAdapter } from './process-cooling-report.adapter';
import { ReportDocument, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-assessment.service';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' }
})
export class ReportComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  private readonly reportAdapter = inject(ProcessCoolingReportAdapter);
  private readonly assessmentService = inject(ProcessCoolingAssessmentService);

  readonly assessment$: Observable<Assessment> = this.assessmentService.assessment$;
  tabsCollapsed = true;
  createdDate: Date;
  reportDocument$: Observable<ReportDocument> = this.assessment$.pipe(
    filter(Boolean),
    switchMap(assessment => this.reportAdapter.buildDocument(assessment))
  );
  assessmentDirectories: Assessment[] = [];
  REPORT_VIEW_LINKS = REPORT_VIEW_LINKS;
  readonly sectionGroups: ReportSectionGroup[] = PROCESS_COOLING_SECTION_GROUPS;

  constructor() {
    this.processCoolingUiService.executiveSummaryViewSignal.set('report');
    this.processCoolingUiService.profileViewSignal.set('report');
    this.createdDate = new Date();
  }

  collapseTabs(): void {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}
