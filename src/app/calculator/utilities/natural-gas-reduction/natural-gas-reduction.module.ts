import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { NaturalGasReductionComponent } from './natural-gas-reduction.component';
import { NaturalGasReductionFormComponent } from './natural-gas-reduction-form/natural-gas-reduction-form.component';
import { NaturalGasReductionHelpComponent } from './natural-gas-reduction-help/natural-gas-reduction-help.component';
import { NaturalGasReductionResultsComponent } from './natural-gas-reduction-results/natural-gas-reduction-results.component';
import { NaturalGasReductionService } from './natural-gas-reduction.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    NaturalGasReductionComponent,
    NaturalGasReductionFormComponent,
    NaturalGasReductionHelpComponent,
    NaturalGasReductionResultsComponent
  ],
  providers: [
    NaturalGasReductionService
  ],
  exports: [
    NaturalGasReductionComponent
  ]
})
export class NaturalGasReductionModule { }
