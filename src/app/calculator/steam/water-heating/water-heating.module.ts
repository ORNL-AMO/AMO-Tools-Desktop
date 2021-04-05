import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterHeatingComponent } from './water-heating.component';
import { WaterHeatingFormComponent } from './water-heating-form/water-heating-form.component';
import { WaterHeatingResultsComponent } from './water-heating-results/water-heating-results.component';
import { WaterHeatingHelpComponent } from './water-heating-help/water-heating-help.component';
import { WaterHeatingService } from './water-heating.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { WaterHeatingFormService } from './water-heating-form.service';



@NgModule({
  declarations: [
    WaterHeatingComponent, 
    WaterHeatingFormComponent, 
    WaterHeatingResultsComponent, 
    WaterHeatingHelpComponent],
  imports: [
    CommonModule,
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    OperatingHoursModalModule,
    SharedPipesModule
  ],
  exports: [
    WaterHeatingComponent
  ],
  providers: [
    WaterHeatingService,
    WaterHeatingFormService
  ]
})
export class WaterHeatingModule { }
