import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Co2SavingsComponent } from './co2-savings.component';
import { Co2SavingsFormComponent } from './co2-savings-form/co2-savings-form.component';
import { Co2SavingsResultsComponent } from './co2-savings-results/co2-savings-results.component';
import { Co2SavingsHelpComponent } from './co2-savings-help/co2-savings-help.component';
import { Co2SavingsService } from './co2-savings.service';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  declarations: [Co2SavingsComponent, Co2SavingsFormComponent, Co2SavingsResultsComponent, Co2SavingsHelpComponent],
  providers: [Co2SavingsService],
  exports: [Co2SavingsComponent]
})
export class Co2SavingsModule { }
