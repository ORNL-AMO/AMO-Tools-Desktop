import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';

import { ConvertUnitsService } from './convert-units/convert-units.service';
import { SigFigsPipe } from './pipes/sig-figs.pipe';
import { PhonePipe } from './pipes/phone.pipe';
import { SettingsLabelPipe } from './pipes/settings-label.pipe';
import { WaterfallGraphComponent } from './waterfall-graph/waterfall-graph.component';
import { WaterfallGraphService } from './waterfall-graph/waterfall-graph.service';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule
  ],
  declarations: [
    SigFigsPipe,
    PhonePipe,
    SettingsLabelPipe,
    WaterfallGraphComponent
  ],
  exports: [
    SigFigsPipe,
    PhonePipe,
    SettingsLabelPipe,
    WaterfallGraphComponent
  ],
  providers: [
    ConvertUnitsService,
    WaterfallGraphService
  ]
})

export class SharedModule { }
