import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PowerFactorCorrectionComponent } from './power-factor-correction.component';
import { PowerFactorCorrectionFormComponent } from './power-factor-correction-form/power-factor-correction-form.component';
import { PowerFactorCorrectionHelpComponent } from './power-factor-correction-help/power-factor-correction-help.component';
import { PowerFactorCorrectionResultsComponent } from './power-factor-correction-results/power-factor-correction-results.component';
import { PowerFactorCorrectionService } from './power-factor-correction.service';
import { FormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ExportableResultsTableModule,
    ReactiveFormsModule
  ],
  declarations: [PowerFactorCorrectionComponent, PowerFactorCorrectionFormComponent, PowerFactorCorrectionHelpComponent, PowerFactorCorrectionResultsComponent],
  providers: [PowerFactorCorrectionService],
  exports: [PowerFactorCorrectionComponent]
})
export class PowerFactorCorrectionModule { }
