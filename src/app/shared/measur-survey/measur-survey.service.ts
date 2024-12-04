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
  
      let hasMetUsageThreshold;
      let dateDifference;
      if (!environment.production) {
        dateDifference = currentDate.diff(firstAppInitDate, 'seconds');
        hasMetUsageThreshold = dateDifference >= 120;
      } else {
        dateDifference = currentDate.diff(firstAppInitDate, 'days');
        hasMetUsageThreshold = dateDifference >= 7;
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
    let measurUserSurvey = this.userSurvey.getValue();
    console.log('measurUserSurvey', measurUserSurvey);
    let url: string = environment.measurUtilitiesApi + 'measur-survey';
    this.httpClient.post(url, measurUserSurvey, httpOptions).subscribe({
      next: (resp) => {
        this.setStatus(resp);
        this.userSurvey.next(undefined);
      },
      error: (error: any) => {
        this.setStatus(undefined, error);
        this.userSurvey.next(undefined);
      }
    });
  }

  setStatus(resp, error?: any) {
    if (resp == "OK") {
      console.log('resp', resp);
      this.completedStatus.next('success');
    } else if (error) {
      this.completedStatus.next('error');
    } else {
      this.completedStatus.next('error');
      console.error(error);
    }
  }

}
