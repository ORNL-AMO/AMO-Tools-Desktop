import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom, Subscription } from 'rxjs';
import { SurveyModalService } from './survey-modal.service';
import { ApplicationInstanceDbService } from '../../../indexedDb/application-instance-db.service';
import { MeasurUserSurvey } from '../experience-survey/experience-survey.component';

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
    private surveyModalService: SurveyModalService) { }

  ngOnInit() {
    this.surveySub = this.surveyModalService.userSurvey.subscribe(survey => {
      this.userSurvey = survey;
    });

    this.statusSub = this.surveyModalService.completedStatus.subscribe(status => {
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
    this.surveyModalService.sendAnswers();
  }

  close(isAppDestroy?: boolean) {
    this.surveyModal.hide();
    this.surveyModalService.showSurveyModal.next(false);
  }

}
