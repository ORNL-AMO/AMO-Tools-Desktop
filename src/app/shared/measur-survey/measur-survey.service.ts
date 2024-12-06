import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationInstanceData } from '../../indexedDb/application-instance-db.service';
import { MeasurUserSurvey } from './experience-survey/experience-survey.component';

@Injectable({
  providedIn: 'root'
})
export class MeasurSurveyService {
  completedStatus: BehaviorSubject<'sending' | 'success' | 'error'>;
  showSurveyModal: BehaviorSubject<boolean>;
  userSurvey: BehaviorSubject<MeasurUserSurvey>;

  constructor(private httpClient: HttpClient) {
    this.showSurveyModal = new BehaviorSubject<boolean>(undefined);
    this.completedStatus = new BehaviorSubject<'sending' | 'success' | 'error'>(undefined);
    this.userSurvey = new BehaviorSubject<MeasurUserSurvey>(undefined);
  }

  getShouldShowSurveyModal(applicationData: ApplicationInstanceData) {
      let firstAppInitDate = moment(new Date(applicationData.createdDate));
      let currentDate = moment(new Date());
  
      let hasMetUsageThreshold: boolean;
      let dateDifference;
      if (!environment.production) {
        dateDifference = currentDate.diff(firstAppInitDate, 'seconds');
        // hasMetUsageThreshold = applicationData.appOpenCount >= 2;
        // hasMetUsageThreshold = dateDifference >= 120;
        hasMetUsageThreshold = dateDifference >= 120 || applicationData.appOpenCount >= 2;
      } else {
        dateDifference = currentDate.diff(firstAppInitDate, 'days');
        hasMetUsageThreshold = dateDifference >= 30 || applicationData.appOpenCount >= 10;
      }
      
      return hasMetUsageThreshold;
  }
 
  async sendAnswers() {
    let httpOptions = {
      responseType: 'text' as const,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    this.completedStatus.next('sending');
    let measurUserSurvey: MeasurUserSurvey = this.userSurvey.getValue();
    console.log('measurUserSurvey', measurUserSurvey);
    let url: string = environment.measurUtilitiesApi + 'measur-survey';
    this.httpClient.post(url, measurUserSurvey, httpOptions).subscribe({
      next: (resp) => {
        this.setStatus(resp);
        this.userSurvey.next(undefined);
      },
      error: (error: any) => {
        this.setStatus(undefined, error);
      }
    });
  }

  setStatus(resp, error?: any) {
    console.log('resp', resp);
    if (resp === "Created") {
      this.completedStatus.next('success');
    } else if (error) {
      this.completedStatus.next('error');
    } else {
      this.completedStatus.next('error');
      console.error(error);
    }
  }

}
