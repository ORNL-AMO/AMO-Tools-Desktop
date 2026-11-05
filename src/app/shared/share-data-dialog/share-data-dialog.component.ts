import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EmailMeasurDataItemComponent } from '../email-measur-data/email-measur-data-item/email-measur-data-item.component';
import { EmailMeasurDataService, MeasurItemAttachment } from '../email-measur-data/email-measur-data.service';
import { ExportToJustifiDialogComponent } from '../export-to-justifi-dialog/export-to-justifi-dialog.component';
import { Assessment } from '../models/assessment';
import { ModalDialogService } from '../modal-dialog.service';

export interface ShareDataDialogData {
  measurItemAttachment: MeasurItemAttachment;
  /** Assessment passed to the JUSTIFI export, in the legacy modification shape that exporter reads. */
  justifiAssessment: Assessment;
}

@Component({
  selector: 'app-share-data-dialog',
  templateUrl: './share-data-dialog.component.html',
  styleUrl: './share-data-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareDataDialogComponent {
  private readonly dialogRef = inject(DialogRef);
  private readonly data = inject<ShareDataDialogData>(DIALOG_DATA);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly emailMeasurDataService = inject(EmailMeasurDataService);

  close(): void {
    this.dialogRef.close();
  }

  emailMeasurData(): void {
    this.emailMeasurDataService.emailItemType.next('PHAST');
    this.close();
    this.modalDialogService.openModal(EmailMeasurDataItemComponent, {
      width: '800px',
      data: { measurItemAttachment: this.data.measurItemAttachment },
    });
  }

  exportToJustifi(): void {
    this.close();
    this.modalDialogService.openModal(ExportToJustifiDialogComponent, {
      width: '75vw',
      maxWidth: '1100px',
      data: { assessment: this.data.justifiAssessment },
    });
  }
}
