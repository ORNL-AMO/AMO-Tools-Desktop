import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { ExportService } from '../import-export/export.service';
import { ImportExportData } from '../import-export/importExportModel';
import { MeasurItemType } from '../models/app';
import { LogToolDbData } from '../../log-tool/log-tool-models';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable({
  providedIn: 'root'
})
export class EmailMeasurDataService {
  modalOpen: BehaviorSubject<boolean>;
  emailSentStatus: BehaviorSubject<EmailSentStatus>;
  measurItemAttachment: MeasurItemAttachment;
  measurEmailData: MeasurEmailData;
  showEmailMeasurDataModal: BehaviorSubject<boolean>;
  emailItemType: BehaviorSubject<string>;
  httpOptions = {
    responseType: 'text' as const,
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };
  
  constructor(private httpClient: HttpClient, private exportService: ExportService, private analyticsService: AnalyticsService) {
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.emailSentStatus = new BehaviorSubject<EmailSentStatus>(undefined);
    this.showEmailMeasurDataModal = new BehaviorSubject<boolean>(undefined);
    this.emailItemType = new BehaviorSubject<string>(undefined);
  }

  setEmailData(measurEmailForm: FormGroup) {
    if (measurEmailForm.valid && this.measurItemAttachment) {
      let attachmentExportData: ImportExportData | LogToolDbData;
      if (this.measurItemAttachment.itemType === 'assessment') {
        attachmentExportData = this.exportService.getSelectedAssessment(this.measurItemAttachment.itemData);
        attachmentExportData['origin'] = "AMO-TOOLS-DESKTOP";
      } else if (this.measurItemAttachment.itemType === 'inventory') {
        attachmentExportData = this.exportService.getSelectedInventory(this.measurItemAttachment.itemData);
        attachmentExportData['origin'] = "AMO-TOOLS-DESKTOP";
      } else if (this.measurItemAttachment.itemType === 'data-explorer') {
        attachmentExportData = this.measurItemAttachment.itemData;
        attachmentExportData['origin'] = "AMO-LOG-TOOL-DATA";
      }


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
    this.emailSentStatus.next('sending');

    let url: string = environment.measurUtilitiesApi + 'sendemail';
    if (this.measurEmailData) {
      const size = new TextEncoder().encode(JSON.stringify(this.measurEmailData)).length
      const kiloBytes = size / 1024;
      console.log('sending file size (kb)', kiloBytes);
      this.httpClient.post(url, this.measurEmailData, this.httpOptions).subscribe({
          next: (resp) => {
            this.setStatus(resp);
          },
          error: (error: any) => {
            this.setStatus(undefined, error);
          }
        });
    }

    if (this.emailItemType.getValue()) {
      let emailItemType: string = this.emailItemType.getValue();

      if (emailItemType === 'PSAT') {
        this.analyticsService.sendEvent('sent-email-PSAT');

      } else if (emailItemType === 'FSAT') {
        this.analyticsService.sendEvent('sent-email-FSAT');

      } else if (emailItemType === 'TreasureHunt') {
        this.analyticsService.sendEvent('sent-email-TH');

      } else if (emailItemType === 'PHAST') {
        this.analyticsService.sendEvent('sent-email-PHAST');

      } else if (emailItemType === 'STEAM') {
        this.analyticsService.sendEvent('sent-email-STEAM');

      } else if (emailItemType === 'PUMP-inventory') {
        this.analyticsService.sendEvent('sent-email-PUMP-inventory');

      } else if (emailItemType === 'MOTOR-inventory') {
        this.analyticsService.sendEvent('sent-email-MOTOR-inventory');

      } else if (emailItemType === 'WasteWater') {
        this.analyticsService.sendEvent('sent-email-WW');

      } else if (emailItemType === 'CompressedAir') {
        this.analyticsService.sendEvent('sent-email-CA');
      }

    }
  }

  setStatus(resp, error?: any) {
    if (resp == "OK") {
      this.emailSentStatus.next('success');
    } else if (error && error.status === 413) {
      this.emailSentStatus.next('content-too-large');
    } else {
      this.emailSentStatus.next('error');
    }
  }

}

export class SendEmailHttpError extends Error { }


export interface MeasurEmailData {
  emailTo: string
  emailSender: string,
  fileName: string,
  attachment: ImportExportData | LogToolDbData,
  isProduction?: boolean;
}

export interface MeasurItemAttachment {
  itemType: MeasurItemType,
  itemName: string,
  itemData: any,
}

export type EmailSentStatus = "success" | "error" | "content-too-large" | 'sending';