import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';

import { ControlMessagesComponent } from './control-messages/control-messages.component';
import { ValidationService } from './validation.service';
import { ModelService } from './model.service';

import { ConvertUnitsService } from './convert-units/convert-units.service';
import { PercentGraphComponent } from './percent-graph/percent-graph.component';
import { SigFigsPipe } from './sig-figs.pipe';
import { UpdateDataService } from './update-data.service';
import { FacilityInfoSummaryComponent } from './facility-info-summary/facility-info-summary.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChartsModule
  ],
  declarations: [
    ControlMessagesComponent,
    PercentGraphComponent,
    SigFigsPipe,
    FacilityInfoSummaryComponent
  ],
  exports: [
    ControlMessagesComponent,
    PercentGraphComponent,
    SigFigsPipe,
    FacilityInfoSummaryComponent
  ],
  providers: [
    ValidationService,
    ModelService,
    ConvertUnitsService,
    UpdateDataService
  ]
})

export class SharedModule { }
