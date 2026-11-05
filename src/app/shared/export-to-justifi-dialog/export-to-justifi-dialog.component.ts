import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../models/assessment';
import { ExportToJustifiTemplateService } from '../export-to-justifi-modal/export-to-justifi-services/export-to-justifi-template.service';

export interface ExportToJustifiDialogData {
  /** PHAST assessment whose modifications carry the legacy `phast` clone the exporter reads. */
  assessment: Assessment;
}

@Component({
  selector: 'app-export-to-justifi-dialog',
  imports: [FormsModule],
  templateUrl: './export-to-justifi-dialog.component.html',
  styleUrl: './export-to-justifi-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportToJustifiDialogComponent {
  private readonly dialogRef = inject(DialogRef);
  private readonly exportToJustifiTemplateService = inject(ExportToJustifiTemplateService);
  private readonly settingsDbService = inject(SettingsDbService);

  readonly assessment: Assessment = inject<ExportToJustifiDialogData>(DIALOG_DATA).assessment;
  readonly modifications = this.assessment.phast.modifications ?? [];
  readonly exportDone = signal(false);
  selectedModificationId: string | undefined = this.modifications[0]?.id;

  close(): void {
    this.dialogRef.close();
  }

  exportToJustifi(): void {
    const assessment: Assessment = { ...this.assessment, phast: { ...this.assessment.phast, selectedModificationId: this.selectedModificationId } };
    const settings = this.settingsDbService.getByAssessmentId(assessment, true);
    this.exportToJustifiTemplateService.exportData(settings, [assessment]);
    this.exportDone.set(true);
  }
}
