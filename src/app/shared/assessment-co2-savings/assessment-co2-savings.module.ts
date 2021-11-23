import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentCo2SavingsComponent } from './assessment-co2-savings.component';
import { AssessmentCo2SavingsService } from './assessment-co2-savings.service';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AssessmentCo2SavingsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    AssessmentCo2SavingsComponent
  ],
  providers: [
    AssessmentCo2SavingsService
  ]
})
export class AssessmentCo2SavingsModule { }
