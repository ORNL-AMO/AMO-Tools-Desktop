import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyModalComponent } from './survey-modal/survey-modal.component';
import { ExperienceSurveyComponent } from './experience-survey/experience-survey.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MeasurSurveyService } from './measur-survey.service';



@NgModule({
  declarations: [SurveyModalComponent, ExperienceSurveyComponent],
  imports: [
    CommonModule,
    ModalModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    SurveyModalComponent,
    ExperienceSurveyComponent
  ],
  providers: [
    MeasurSurveyService
  ]
})
export class MeasurSurveyModule { }
