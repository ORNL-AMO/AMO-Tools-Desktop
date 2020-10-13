import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GasDensityResultsComponent } from './gas-density-results.component';
import { SharedPipesModule } from '../shared-pipes/shared-pipes.module';



@NgModule({
  declarations: [
    GasDensityResultsComponent
  ],
  imports: [
    CommonModule,
    SharedPipesModule
  ],
  exports: [
    GasDensityResultsComponent
  ]
})
export class GasDensityResultsModule { }
