import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { PdfReportService } from '../../services/pdf-report.service';
import { ReportDocument } from '../../models/report-document.model';

@Component({
  selector: 'app-export-button',
  standalone: true,
  template: `
    <button
      class="btn btn-primary"
      [disabled]="exporting()"
      (click)="onExport()">
      @if (exporting()) {
        <span class="fa fa-spinner fa-spin mr-1"></span>
      }
      {{ exporting() ? 'Generating PDF...' : 'Export PDF' }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportButtonComponent {
  readonly document = input.required<ReportDocument>();
  readonly assessmentName = input('report');

  private readonly pdf = inject(PdfReportService);
  readonly exporting = signal(false);

  readonly filename = computed(() => `${this.assessmentName()}-report.pdf`);

  async onExport(): Promise<void> {
    if (this.exporting() || !this.document()) return;
    this.exporting.set(true);
    try {
      await this.pdf.export(this.document(), this.filename());
    } finally {
      this.exporting.set(false);
    }
  }
}
