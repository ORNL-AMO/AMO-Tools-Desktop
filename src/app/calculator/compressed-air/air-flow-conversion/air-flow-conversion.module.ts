import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AirFlowConversionComponent } from './air-flow-conversion.component';
import { AirFlowConversionService } from './air-flow-conversion.service';
import { AirFlowConversionFormComponent } from './air-flow-conversion-form/air-flow-conversion-form.component';



@NgModule({
  declarations: [
    AirFlowConversionComponent,
    AirFlowConversionFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    AirFlowConversionService
  ]
})
export class AirFlowConversionModule { }
