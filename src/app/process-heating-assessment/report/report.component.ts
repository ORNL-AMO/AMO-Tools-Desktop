import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { filter, Observable, switchMap } from 'rxjs';
import { Assessment } from '../../shared/models/assessment';
import { ReportDocument, ReportSectionGroup } from '../../shared/report-builder/models/report-document.model';
import { REPORT_VIEW_LINKS } from '../models/views';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { PROCESS_HEATING_SECTION_GROUPS, ProcessHeatingReportAdapter } from './process-heating-report.adapter';

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' }
})
export class ReportComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly reportAdapter = inject(ProcessHeatingReportAdapter);

  readonly REPORT_VIEW_LINKS = REPORT_VIEW_LINKS;
  readonly sectionGroups: ReportSectionGroup[] = PROCESS_HEATING_SECTION_GROUPS;
  readonly assessment$: Observable<Assessment> = this.assessmentService.assessment$;
  readonly reportDocument$: Observable<ReportDocument> = this.assessment$.pipe(
    filter(Boolean),
    switchMap(assessment => this.reportAdapter.buildDocument(assessment))
  );
}
