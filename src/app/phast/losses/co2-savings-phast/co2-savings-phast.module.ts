import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { Co2SavingsPhastComponent } from './co2-savings-phast.component';
import { Co2SavingsFormComponent } from './co2-savings-form/co2-savings-form.component';
import { Co2SavingsResultsComponent } from './co2-savings-results/co2-savings-results.component';
import { Co2SavingsHelpComponent } from './co2-savings-help/co2-savings-help.component';
import { Co2SavingsPhastService } from './co2-savings-phast.service';



@NgModule({
  declarations: [
    Co2SavingsPhastComponent, 
    Co2SavingsFormComponent,
    Co2SavingsResultsComponent,
    Co2SavingsHelpComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ExportableResultsTableModule
  ],
  providers: [
    Co2SavingsPhastService
  ],
  exports: [
    Co2SavingsPhastComponent
  ]
})
export class Co2SavingsPhastModule { }
