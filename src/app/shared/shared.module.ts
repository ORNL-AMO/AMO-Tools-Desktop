import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';

import { ControlMessagesComponent } from './control-messages/control-messages.component';
import { ValidationService } from './validation.service';
import { ModelService } from './model.service';

import { ConvertUnitsService } from './convert-units/convert-units.service';
import { PercentGraphComponent } from './percent-graph/percent-graph.component';

@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      ChartsModule
  ],
  declarations: [
    ControlMessagesComponent,
    PercentGraphComponent
  ],
  exports: [
    ControlMessagesComponent,
    PercentGraphComponent
  ],
  providers: [
    ValidationService,
    ModelService,
    ConvertUnitsService
  ]
})

export class SharedModule { }
