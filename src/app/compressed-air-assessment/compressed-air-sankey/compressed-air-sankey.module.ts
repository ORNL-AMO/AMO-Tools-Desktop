import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirSankeyComponent } from './compressed-air-sankey.component';
import { PowerSankeyComponent } from './power-sankey/power-sankey.component';
import { AirflowSankeyComponent } from './airflow-sankey/airflow-sankey.component';
import { AirflowSankeyService } from './airflow-sankey/airflow-sankey.service';
import { PowerSankeyService } from './power-sankey/power-sankey.service';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EndUseDayTypeSetupModule } from '../baseline-tab-content/end-uses-setup/end-uses-form/day-type-setup-form/end-use-day-type-setup.module';



@NgModule({
  declarations: [
    PowerSankeyComponent, AirflowSankeyComponent, CompressedAirSankeyComponent],
  imports: [
    CommonModule,
    SharedPipesModule,
    FormsModule,
    ReactiveFormsModule,
    EndUseDayTypeSetupModule
  ],
  exports: [
    PowerSankeyComponent, AirflowSankeyComponent, CompressedAirSankeyComponent
  ],
  providers: [ 
    AirflowSankeyService,
    PowerSankeyService
  ]
})
export class CompressedAirSankeyModule { }
