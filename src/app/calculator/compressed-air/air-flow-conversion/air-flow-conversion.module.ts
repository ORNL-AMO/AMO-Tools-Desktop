import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AirFlowConversionComponent } from './air-flow-conversion.component';
import { AirFlowConversionService } from './air-flow-conversion.service';
import { AirFlowConversionFormComponent } from './air-flow-conversion-form/air-flow-conversion-form.component';
import { AirFlowConversionHelpComponent } from './air-flow-conversion-help/air-flow-conversion-help.component';
import { AirFlowConversionResultsComponent } from './air-flow-conversion-results/air-flow-conversion-results.component';



@NgModule({
  declarations: [
    AirFlowConversionComponent,
    AirFlowConversionFormComponent,
    AirFlowConversionHelpComponent,
    AirFlowConversionResultsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    AirFlowConversionComponent
  ],
  providers: [
    AirFlowConversionService
  ]
})
export class AirFlowConversionModule { }
