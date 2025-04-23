import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApplicationInstanceData } from '../../indexedDb/application-instance-db.service';
import { MeasurUserSurvey } from './experience-survey/experience-survey.component';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { Directory } from '../models/directory';

@Injectable({
  providedIn: 'root'
})
export class MeasurSurveyService {
  completedStatus: BehaviorSubject<'sending' | 'success' | 'error'>;
  showSurveyModal: BehaviorSubject<boolean>;
  userSurvey: BehaviorSubject<MeasurUserSurvey>;

  constructor(private httpClient: HttpClient, private directoryDbService: DirectoryDbService) {
    this.showSurveyModal = new BehaviorSubject<boolean>(undefined);
    this.completedStatus = new BehaviorSubject<'sending' | 'success' | 'error'>(undefined);
    this.userSurvey = new BehaviorSubject<MeasurUserSurvey>(undefined);
  }

 getHasModalUsageRequirements(applicationData: ApplicationInstanceData) {
      if (environment.production) {
        return applicationData.appOpenCount >= 10;
      } else {
        return applicationData.appOpenCount >= 3;
      }
  }

  getHasToastUsageRequirements(applicationData: ApplicationInstanceData) {
    if (environment.production) {
      return applicationData.appOpenCount >= 5;
    } else {
      return applicationData.appOpenCount >= 2;
    }
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
