import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { PdfReportService } from '../../services/pdf-report.service';
import { ReportDocument } from '../../models/report-document.model';

@Component({
  selector: 'app-export-button',
  standalone: true,
  template: `
    <button
      class="btn btn-primary"
      [disabled]="isExporting()"
      (click)="onExport()">
      @if (isExporting()) {
        <span class="fa fa-spinner fa-spin mr-1"></span>
      }
      {{ isExporting() ? 'Generating PDF...' : 'Export PDF' }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportButtonComponent {
  readonly document = input.required<Observable<ReportDocument>>();
  readonly assessmentName = input('report');

  private readonly pdf = inject(PdfReportService);
  readonly isExporting = signal(false);

  readonly filename = computed(() => `${this.assessmentName()}-report.pdf`);

  async onExport(): Promise<void> {
    if (this.isExporting()) return;
    this.isExporting.set(true);
    try {
      const doc = await firstValueFrom(this.document());
      await this.pdf.export(doc, this.filename());
    } finally {
      this.isExporting.set(false);
    }
  }
}
