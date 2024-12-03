import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyToastComponent } from './survey-toast/survey-toast.component';
import { SurveyModalModule } from '../survey-modal/survey-modal.module';



@NgModule({
  declarations: [SurveyToastComponent],
  imports: [
    SurveyModalModule,
    CommonModule
  ], 
  exports: [SurveyToastComponent]
})
export class SurveyToastModule { }
