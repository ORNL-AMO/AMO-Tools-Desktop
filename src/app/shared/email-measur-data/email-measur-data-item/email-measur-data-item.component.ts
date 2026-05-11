import { Component, inject, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Subscription } from 'rxjs';
import { EmailMeasurDataService, EmailSentStatus, MeasurItemAttachment } from '../email-measur-data.service';
import { truncate } from '../../helperFunctions';

@Component({
  selector: 'app-email-measur-data-item',
  templateUrl: './email-measur-data-item.component.html',
  styleUrls: ['./email-measur-data-item.component.css'],
  standalone: false
})
export class EmailMeasurDataItemComponent {
  dialogRef = inject<DialogRef<string>>(DialogRef);

  measurItemName: string = 'assessment';
  isFormValid: boolean;
  emailSentStatus: EmailSentStatus;
  emailSentStatusSubscription: Subscription;

  constructor(
    private emailMeasurDataService: EmailMeasurDataService,
    @Inject(DIALOG_DATA) private dialogData: EmailMeasurDataItemComponentDataInputs
  ) {}

  ngOnInit() {
    if (this.dialogData?.measurItemAttachment) {
      this.emailMeasurDataService.measurItemAttachment = this.dialogData.measurItemAttachment;
      this.measurItemName = truncate(this.dialogData.measurItemAttachment.itemName);
    }

    this.emailSentStatusSubscription = this.emailMeasurDataService.emailSentStatus.subscribe(sentStatus => {
      this.emailSentStatus = sentStatus;
    });
  }

  ngOnDestroy() {
    this.emailSentStatusSubscription.unsubscribe();
  }

  onFormValid(isFormValid?: boolean) {
    this.isFormValid = isFormValid;
    this.emailMeasurDataService.emailSentStatus.next(undefined);
  }

  close() {
    this.dialogRef.close();
  }

  sendEmail() {
    this.emailMeasurDataService.sendEmail();
  }
}

export interface EmailMeasurDataItemComponentDataInputs {
  measurItemAttachment: MeasurItemAttachment;
}
