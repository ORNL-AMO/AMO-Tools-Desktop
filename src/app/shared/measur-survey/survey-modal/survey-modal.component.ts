import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom, Subscription } from 'rxjs';
import { MeasurUserSurvey } from '../experience-survey/experience-survey.component';
import { MeasurSurveyService } from '../measur-survey.service';
import { ApplicationInstanceDbService } from '../../../indexedDb/application-instance-db.service';
import { EmailListSubscribeService } from '../../subscribe-toast/email-list-subscribe.service';

@Component({
    selector: 'app-survey-modal',
    templateUrl: './survey-modal.component.html',
    styleUrl: './survey-modal.component.css',
    standalone: false
})
export class SurveyModalComponent {
  @ViewChild('surveyModal', { static: false }) public surveyModal: ModalDirective;
  userSurvey: MeasurUserSurvey;
  surveySub: Subscription;
  statusSub: Subscription;

  constructor(
    private measurSurveyService: MeasurSurveyService, 
    private emailSubscriberService: EmailListSubscribeService,
    private applicationInstanceDbService: ApplicationInstanceDbService) { }

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
    this.submitSubscriberEmail();
    this.measurSurveyService.sendAnswers();
  }

  submitSubscriberEmail() {
    let measurUserSurvey: MeasurUserSurvey = this.measurSurveyService.userSurvey.getValue();
    if (measurUserSurvey.shouldCreateSubscriber)  {
      this.emailSubscriberService.submitSubscriberEmail(measurUserSurvey.email).subscribe();
    }
  }

  async setRemindAndClose() {
    await firstValueFrom(this.applicationInstanceDbService.setSurveyDone(false));
    this.close();
  }

  close() {
    this.surveyModal.hide();
    this.measurSurveyService.showSurveyModal.next(false);
  }

}
