import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { ApplicationInstanceDbService } from '../../../indexedDb/application-instance-db.service';
import { SurveyModalService } from '../survey-modal/survey-modal.service';

@Component({
  selector: 'app-experience-survey',
  templateUrl: './experience-survey.component.html',
  styleUrl: './experience-survey.component.css'
})
export class ExperienceSurveyComponent {
  @Input()
  inModal: boolean;
  measurUserSurvey: MeasurUserSurvey;
  completedStatus: "success" | "error" | 'sending';

  userSurveyForm: FormGroup;
  statusSub: Subscription;
  constructor(
    private surveyModalService: SurveyModalService,
    private router: Router,
    private appInstanceDbService: ApplicationInstanceDbService, 
    private fb: FormBuilder) { }

  ngOnInit() {
    this.initForm();
    this.statusSub = this.surveyModalService.completedStatus.subscribe(status => {
      this.completedStatus = status; 
      if (this.completedStatus === 'success' && !this.inModal) {
        this.setSurveyDone();
      }
    });

  }

  ngOnDestroy() {
    this.statusSub.unsubscribe();
  }

  initForm() {
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
    this.surveyModalService.completedStatus.next(undefined)
    this.surveyModalService.userSurvey.next(undefined)
  }

  async setSurveyDone() {
    let appData = await firstValueFrom(this.appInstanceDbService.setSurveyDone());
    this.appInstanceDbService.applicationInstanceData.next(appData);
  }

  setRatingValue(controlName: string, val: number) {
    this.userSurveyForm.get(controlName)?.patchValue(val);
    this.save();
  }

  save() {
    if (this.userSurveyForm.controls.email.valid) {
      this.surveyModalService.userSurvey.next(this.getSurveyFromForm())
    } else {
      this.surveyModalService.userSurvey.next(undefined)
    }
  }

  sendAnswers() {
    this.surveyModalService.sendAnswers();
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

  getSurveyFromForm(): MeasurUserSurvey {
    return {
      email: this.userSurveyForm.controls.email.value,
      companyName: this.userSurveyForm.controls.companyName.value,
      contactName: this.userSurveyForm.controls.contactName.value,
      usefulRating: this.userSurveyForm.controls.usefulRating.value,
      recommendRating: this.userSurveyForm.controls.recommendRating.value,
      questionDescribeSuccess: this.userSurveyForm.controls.questionDescribeSuccess.value,
      hasProfilingInterest: this.userSurveyForm.controls.hasProfilingInterest.value,
      questionFeedback: this.userSurveyForm.controls.questionFeedback.value, 
    }
  }

  navigateToPrivacyNotice() {
    this.surveyModalService.showSurveyModal.next(false);
    this.router.navigate(['/privacy']);
  }
}


export interface MeasurUserSurvey {
  // appInstanceId: string,
  email: string,
  companyName: string,
  contactName: string,
  usefulRating: number,
  recommendRating: number,
  questionDescribeSuccess: string,
  hasProfilingInterest: boolean,
  questionFeedback: string, 
}