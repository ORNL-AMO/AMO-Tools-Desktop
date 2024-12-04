import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyToastComponent } from './survey-toast/survey-toast.component';
import { MeasurSurveyModule } from '../measur-survey/measur-survey.module';



@NgModule({
  declarations: [SurveyToastComponent],
  imports: [
    MeasurSurveyModule,
    CommonModule
  ], 
  exports: [SurveyToastComponent]
})
export class SurveyToastModule { }
