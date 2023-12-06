import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { ExportService } from '../import-export/export.service';
import { ImportExportData } from '../import-export/importExportModel';

@Injectable({
  providedIn: 'root'
})
export class EmailMeasurDataService {
  modalOpen: BehaviorSubject<boolean>;
  emailSentStatus: BehaviorSubject<EmailSentStatus>;
  measurItemAttachment: MeasurItemAttachment;
  measurEmailData: MeasurEmailData;
  showEmailMeasurDataModal: BehaviorSubject<boolean>;
  httpOptions = {
    responseType: 'text' as const,
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };
  
  constructor(private httpClient: HttpClient, private exportService: ExportService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.emailSentStatus = new BehaviorSubject<EmailSentStatus>(undefined);
    this.showEmailMeasurDataModal = new BehaviorSubject<boolean>(undefined);
  }

  setEmailData(measurEmailForm: FormGroup) {
    if (measurEmailForm.valid) {
      let attachmentExportData: ImportExportData = this.exportService.getSelectedAssessment(this.measurItemAttachment.itemData);
      attachmentExportData.origin = "AMO-TOOLS-DESKTOP";
      // todo eventually handle list of receivers/ attachments
      this.measurEmailData = {
        emailTo: measurEmailForm.controls.emailTo.value,
        emailSender: measurEmailForm.controls.emailSender.value,
        fileName: this.measurItemAttachment.itemName,
        attachment: attachmentExportData,
        isProduction: environment.production
      }
    } else {
      this.measurEmailData = undefined
    }
  }

  sendEmail() {
    // todo start spinner
    let url: string = environment.measurUtilitiesApi + 'sendemail';
    if (this.measurEmailData) {
      this.httpClient.post(url, this.measurEmailData, this.httpOptions).subscribe({
          next: (resp) => {
            this.setStatus(resp);
          },
          error: (error: HttpErrorResponse) => {
            this.setStatus(undefined, error);
          }
        });
    }
    
  }

  setStatus(resp, error?: HttpErrorResponse) {
    if (resp == "OK") {
      this.emailSentStatus.next('success');
    } else if (error && error.status === 413) {
      this.emailSentStatus.next('content-too-large');
    } else {
      this.emailSentStatus.next('error');
    }
    // todo end spinner
  }

}

export class SendEmailHttpError extends Error { }


export interface MeasurEmailData {
  emailTo: string
  emailSender: string,
  fileName: string,
  attachment: ImportExportData,
  isProduction?: boolean;
}

export interface MeasurItemAttachment {
  itemType: string,
  itemName: string,
  itemData: any,
}

export type EmailSentStatus = "success" | "error" | "content-too-large";