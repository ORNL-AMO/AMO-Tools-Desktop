import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalyticsDataIdbService } from '../../../indexedDb/analytics-data-idb.service';
import { AppAnalyticsData } from '../../analytics/analytics.service';
import { SurveyModalService } from './survey-modal.service';
import { Router } from '@angular/router';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../../../indexedDb/application-instance-db.service';

@Component({
  selector: 'app-survey-modal',
  templateUrl: './survey-modal.component.html',
  styleUrl: './survey-modal.component.css'
})
export class SurveyModalComponent {
  measurUserSurvey: MeasurUserSurvey;
  completedStatus: "success" | "error" | 'sending';
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
    private surveyModalService: SurveyModalService,
    private router: Router,
    private appInstanceDbService: ApplicationInstanceDbService, 
    private fb: FormBuilder) { }

  // todo need to refine open/destroy cycle... survey can't be reopened after close
  // todo get screen height
  ngOnInit() {
    const defaultFormData = this.getDefaultForm();
    this.userSurveyForm = this.fb.group({
      email: [defaultFormData.email, [Validators.email]],
      companyName: [defaultFormData.companyName, []],
      contactName: [defaultFormData.contactName, []],
      usefulRating: [defaultFormData.usefulRating, []],
      recommendRating: [defaultFormData.recommendRating, []],
      questionDescribeSuccess: [defaultFormData.questionDescribeSuccess, []],
      hasProfilingInterest: [defaultFormData.hasProfilingInterest, []],
      questionFeedback: [defaultFormData.questionFeedback, []],
      
    });

  }

  ngOnDestroy() {
    this.close();
  }

  ngAfterViewInit() {
    this.surveyModal.show();
  }

  save() {}

  async sendAnswers() {
    if (this.userSurveyForm.controls.email.valid) {
      this.completedStatus = 'sending';
      const appInstanceData: ApplicationInstanceData[] = await firstValueFrom(this.appInstanceDbService.getApplicationInstanceData());
      // const measurInstanceId = appInstanceData[0].;
      this.measurUserSurvey = this.userSurveyForm.value;
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
      this.completedStatus = 'success'
    } else if (error) {
      this.completedStatus = 'error';
    } else {
      this.completedStatus = 'error';
      console.error(error);
    }
  }

  close() {
    this.surveyModal.hide();
    this.surveyModalService.showSurveyModal.next(false);
  }

  setRatingValue(controlName: string, val: number) {
    this.userSurveyForm.get(controlName)?.patchValue(val);
  }

  getDefaultForm() {
    return {
      email: undefined,
      companyName: undefined,
      contactName: undefined,
      usefulRating: undefined,
      recommendRating: undefined,
      questionDescribeSuccess: undefined,
      hasProfilingInterest: undefined,
      questionFeedback: undefined, 
    }
  }

  navigateToPrivacyNotice() {
    this.surveyModalService.showSurveyModal.next(false);
    this.router.navigate(['/privacy']);
  }
}


export interface MeasurUserSurvey {
  appInstanceId: string,
  email: string,
  companyName: string,
  contactName: string,
  usefulRating: number,
  recommendRating: number,
  questionDescribeSuccess: string,
  hasProfilingInterest: boolean,
  questionFeedback: string, 
}