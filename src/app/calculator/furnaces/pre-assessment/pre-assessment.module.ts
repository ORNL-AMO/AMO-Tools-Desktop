import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../../../shared/shared.module';
import { PreAssessmentComponent } from './pre-assessment.component';
import { DesignedEnergyModule } from '../../../phast/designed-energy/designed-energy.module';
import { MeteredEnergyModule } from '../../../phast/metered-energy/metered-energy.module';
import { PreAssessmentFormComponent } from './pre-assessment-form/pre-assessment-form.component';
import { PreAssessmentGraphComponent } from './pre-assessment-graph/pre-assessment-graph.component';
import { PreAssessmentHelpComponent } from './pre-assessment-help/pre-assessment-help.component';
import { ChartsModule } from 'ng2-charts';
import { PreAssessmentMeteredComponent } from './pre-assessment-form/pre-assessment-metered/pre-assessment-metered.component';
import { PreAssessmentDesignedComponent } from './pre-assessment-form/pre-assessment-designed/pre-assessment-designed.component';
import { ConvertPhastService } from '../../../phast/convert-phast.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DesignedEnergyModule,
    MeteredEnergyModule,
    ChartsModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  declarations: [
    PreAssessmentComponent,
    PreAssessmentFormComponent,
    PreAssessmentGraphComponent,
    PreAssessmentHelpComponent,
    PreAssessmentDesignedComponent,
    PreAssessmentMeteredComponent
  ],
  exports: [
    PreAssessmentComponent
  ],
  providers: [
    ConvertPhastService
  ]
})
export class PreAssessmentModule { }
