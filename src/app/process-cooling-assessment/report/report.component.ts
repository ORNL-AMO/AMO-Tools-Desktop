import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Assessment } from '../../shared/models/assessment';
import { ProcessCoolingUiService, REPORT_VIEW_LINKS } from '../services/process-cooling-ui.service';
import { ProcessCoolingReportAdapter } from './process-cooling-report.adapter';
import { ReportDocument, ReportMeta } from '../../shared/report-builder/models/report-document.model';

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
  private readonly destroyRef = inject(DestroyRef);

  @Input() assessment: Assessment;

  // todo may no longer be needed
  @Input() inAssessment: boolean;
  @Input() containerHeight: number;
  @Input() inRollup: boolean;
  @Input() quickReport: boolean;

  tabsCollapsed = true;
  createdDate: Date;
  reportDocument: ReportDocument | null = null;
  assessmentDirectories: any[] = [];
  REPORT_VIEW_LINKS = REPORT_VIEW_LINKS;

  ngOnInit(): void {
    this.processCoolingUiService.executiveSummaryViewSignal.set('report');
    this.processCoolingUiService.profileViewSignal.set('report');
    this.createdDate = new Date();

    const meta: ReportMeta = {
      title: this.assessment?.name ?? 'Process Cooling Assessment',
      date: new Date().toISOString(),
    };

    this.reportAdapter.buildDocument(meta)
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(doc => { this.reportDocument = doc; });
  }

  collapseTabs(): void {
    this.tabsCollapsed = !this.tabsCollapsed;
  }
}
