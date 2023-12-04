import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { EmailMeasurDataService, EmailSentStatus } from '../email-measur-data.service';
import { HelperFunctionsService } from '../../helper-services/helper-functions.service';

@Component({
  selector: 'app-email-measur-data-modal',
  templateUrl: './email-measur-data-modal.component.html',
  styleUrls: ['./email-measur-data-modal.component.css']
})
export class EmailMeasurDataModalComponent {
  measurItemName: string = 'assessment';
  @Output('emitModalClosed')
  modalClosed = new EventEmitter<boolean>();
  @ViewChild('emailMeasurDataModal', { static: false }) public emailMeasurDataModal: ModalDirective;
  onHiddenSubscription: Subscription;
  isFormValid: boolean;
  emailSentStatus: EmailSentStatus;
  emailSentStatusSubscription: Subscription;

  constructor(private emailMeasurDataService: EmailMeasurDataService, private helperFunctions: HelperFunctionsService) {}

  ngOnInit() {
    this.measurItemName = 'assessment';
    if (this.emailMeasurDataService.measurItemAttachment) {
      this.measurItemName = this.helperFunctions.truncate(this.emailMeasurDataService.measurItemAttachment.itemName);
      console.log(this.emailMeasurDataService.measurItemAttachment)
    };

    this.emailSentStatusSubscription = this.emailMeasurDataService.emailSentStatus.subscribe(sentStatus => {
      this.emailSentStatus = sentStatus;
    });

  }

  ngOnDestroy() {
    if (this.onHiddenSubscription) {
      this.onHiddenSubscription.unsubscribe();
      this.emailSentStatusSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.emailMeasurDataModal.show();
    this.onHiddenSubscription = this.emailMeasurDataModal.onHidden.subscribe(() => {
      this.close()
    });
  }

  onFormValid(isFormValid?: boolean) {
    this.isFormValid = isFormValid;
  }

  close() {
    this.emailMeasurDataModal.hide();
    this.modalClosed.emit(true)
  }

  sendEmail() {
    this.emailMeasurDataService.sendEmail();
  }
}
