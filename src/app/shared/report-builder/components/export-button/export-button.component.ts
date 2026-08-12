import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, linkedSignal, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { PdfReportService } from '../../services/pdf-report.service';
import { ReportDocument } from '../../models/report-document.model';
import { ReportSectionGroup } from '../../models/report-document.model';

@Component({
  selector: 'app-export-button',
  standalone: true,
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class ExportButtonComponent {
  readonly document = input.required<Observable<ReportDocument>>();
  readonly assessmentName = input('report');
  readonly sectionGroups = input<ReportSectionGroup[]>([]);

  private readonly pdf = inject(PdfReportService);
  private readonly el = inject(ElementRef);
  readonly isExporting = signal(false);
  readonly isPanelOpen = signal(false);

  readonly filename = computed(() => `${this.assessmentName()}-report.pdf`);
  readonly hasSectionGroups = computed(() => this.sectionGroups().length > 0);
  readonly hasAnyGroupSelected = computed(() => Object.values(this.checkedGroups()).some(Boolean));

  readonly checkedGroups = linkedSignal({
    source: this.sectionGroups,
    computation: (groups: ReportSectionGroup[]) =>
      Object.fromEntries(groups.map(g => [g.key, true])) as Record<string, boolean>,
  });

  onButtonClick(): void {
    if (!this.hasSectionGroups()) {
      this.onExport();
    } else {
      this.isPanelOpen.update(v => !v);
    }
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isPanelOpen.set(false);
    }
  }

  toggleGroup(key: string): void {
    this.checkedGroups.update(groups => ({ ...groups, [key]: !groups[key] }));
  }

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

  async onExportSelected(): Promise<void> {
    if (this.isExporting()) return;
    this.isExporting.set(true);
    try {
      const doc = await firstValueFrom(this.document());
      const selectedKeys = new Set(
        Object.entries(this.checkedGroups())
          .filter(([, checked]) => checked)
          .map(([key]) => key)
      );
      const filteredDoc: ReportDocument = {
        ...doc,
        sections: doc.sections.filter(s => !s.group || selectedKeys.has(s.group)),
      };
      await this.pdf.export(filteredDoc, this.filename());
    } finally {
      this.isExporting.set(false);
      this.isPanelOpen.set(false);
    }
  }
}
