import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';

import { ConvertUnitsService } from './convert-units/convert-units.service';
import { SigFigsPipe } from './pipes/sig-figs.pipe';
import { PhonePipe } from './pipes/phone.pipe';
import { SettingsLabelPipe } from './pipes/settings-label.pipe';
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
    SettingsLabelPipe
  ],
  exports: [
    SigFigsPipe,
    PhonePipe,
    SettingsLabelPipe
  ],
  providers: [
    ConvertUnitsService
  ]
})

export class SharedModule { }
