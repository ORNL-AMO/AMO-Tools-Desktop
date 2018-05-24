import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PowerFactorCorrectionComponent } from './power-factor-correction.component';
import { PowerFactorCorrectionFormComponent } from './power-factor-correction-form/power-factor-correction-form.component';
import { PowerFactorCorrectionHelpComponent } from './power-factor-correction-help/power-factor-correction-help.component';
import { PowerFactorCorrectionResultsComponent } from './power-factor-correction-results/power-factor-correction-results.component';
import { PowerFactorCorrectionService } from './power-factor-correction.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [PowerFactorCorrectionComponent, PowerFactorCorrectionFormComponent, PowerFactorCorrectionHelpComponent, PowerFactorCorrectionResultsComponent],
  providers: [PowerFactorCorrectionService],
  exports: [PowerFactorCorrectionComponent]
})
export class PowerFactorCorrectionModule { }
