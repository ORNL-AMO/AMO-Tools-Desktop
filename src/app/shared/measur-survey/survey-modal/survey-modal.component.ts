import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { MeasurUserSurvey } from '../experience-survey/experience-survey.component';
import { MeasurSurveyService } from '../measur-survey.service';

@Component({
  selector: 'app-survey-modal',
  templateUrl: './survey-modal.component.html',
  styleUrl: './survey-modal.component.css'
})
export class SurveyModalComponent {
  @ViewChild('surveyModal', { static: false }) public surveyModal: ModalDirective;
  userSurvey: MeasurUserSurvey;
  surveySub: Subscription;
  statusSub: Subscription;

  constructor(
    private measurSurveyService: MeasurSurveyService) { }

  ngOnInit() {
    this.surveySub = this.measurSurveyService.userSurvey.subscribe(survey => {
      this.userSurvey = survey;
    });

    this.statusSub = this.measurSurveyService.completedStatus.subscribe(status => {
      if (status === 'success') {
        this.close();
      }
    });
  }

  ngOnDestroy() {
    this.close();
    this.surveySub.unsubscribe();
    this.statusSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.surveyModal.show();
  }

  sendAnswers() {
    this.measurSurveyService.sendAnswers();
  }

  close(isAppDestroy?: boolean) {
    this.surveyModal.hide();
    this.measurSurveyService.showSurveyModal.next(false);
  }

}
