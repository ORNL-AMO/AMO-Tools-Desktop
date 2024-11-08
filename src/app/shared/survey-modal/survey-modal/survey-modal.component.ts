import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalyticsDataIdbService } from '../../../indexedDb/analytics-data-idb.service';
import { AppAnalyticsData } from '../../analytics/analytics.service';

@Component({
  selector: 'app-survey-modal',
  templateUrl: './survey-modal.component.html',
  styleUrl: './survey-modal.component.css'
})
export class SurveyModalComponent {
  measurUserSurvey: MeasurUserSurvey;

  httpOptions = {
    responseType: 'text' as const,
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  userSurveyForm: FormGroup;

  @ViewChild('surveyModal', { static: false }) public surveyModal: ModalDirective;

  constructor(
    private httpClient: HttpClient, 
    private analyticsDataIdbService: AnalyticsDataIdbService, 
    private fb: FormBuilder) { }

  //  todo need to refine open/destroy cycle... survey can't be reopened after close
  ngOnInit() {
    const defaultFormData = this.getDefaultForm();
    this.userSurveyForm = this.fb.group({
      email: [defaultFormData.email, [Validators.email]],
      questionA: [defaultFormData.questionA, []],
      questionB: [defaultFormData.questionB, []],
      dropdownA: [defaultFormData.dropdownA, []],
      dropdownB: [defaultFormData.dropdownB, []],
      
    });

  }
  ngAfterViewInit() {
    this.surveyModal.show();
  }

  save() {
    
  }

  async sendAnswers() {
    if (this.userSurveyForm.controls.email.valid) {
      const appAnalyticsData: AppAnalyticsData[] = await firstValueFrom(this.analyticsDataIdbService.getAppAnalyticsData());
      debugger;
      // todo we will not have instance data if is web.. should build into appinstancedata
      const measurInstanceId = 'afhdskufydsauf';
      // const measurInstanceId = appAnalyticsData[0].clientId;
      this.measurUserSurvey = {
        appInstanceId: measurInstanceId,
        surveyForm: this.userSurveyForm.value
        
      } 
      console.log('appAnalyticsData', appAnalyticsData);
      console.log('req body', this.measurUserSurvey);
      let url: string = environment.measurUtilitiesApi + 'measur-survey';
      this.httpClient.post(url, this.measurUserSurvey, this.httpOptions).subscribe({
        next: (resp) => {
          this.setStatus(resp);
          this.close();
        },
        error: (error: any) => {
          this.setStatus(undefined, error);
          // todo display error
        }
      });
    } 
  }

  setStatus(resp, error?: any) {
    if (resp == "OK") {
      console.log('resp', resp);
      //  todo set survey as taken
    } else if (error && error.status === 413) {
      console.log('resp error', error)
    } else {
      console.error(error);
    }
  }

  close() {
    this.surveyModal.hide();
    // this.surveyModal.emit(shouldDelete);
  }

  getDefaultForm() {
    return {
        email: undefined,
        questionA: undefined,
        questionB: undefined,
        dropdownA: undefined,
        dropdownB: undefined,
      };
  }
}


export interface MeasurUserSurvey {
  appInstanceId: string,
  surveyForm: SurveyFormData
}

//todo date
export interface SurveyFormData {
  email: string,
  questionA: string,
  questionB: string,
  dropdownA: string,
  dropdownB: string,
}