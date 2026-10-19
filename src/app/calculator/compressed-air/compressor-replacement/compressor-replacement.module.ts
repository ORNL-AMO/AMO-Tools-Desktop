import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { FormControlErrorsComponent } from '../../../shared/form-control-errors.component';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { AltitudeCorrectionService } from '../../utilities/altitude-correction/altitude-correction.service';
import { CompressorReplacementComponent } from './compressor-replacement.component';
import { CompressorReplacementFormComponent } from './compressor-replacement-form/compressor-replacement-form.component';
import { CompressorReplacementResultsComponent } from './compressor-replacement-results/compressor-replacement-results.component';
import { CompressorReplacementHelpComponent } from './compressor-replacement-help/compressor-replacement-help.component';
import { CompressorReplacementPlotComponent } from './compressor-replacement-plot/compressor-replacement-plot.component';
import { CompressorReplacementService } from './compressor-replacement.service';
import { CompressorCagiService } from './compressor-cagi.service';
import { CompressorAdapterService } from './compressor-adapter.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OperatingHoursModalModule,
    FormControlErrorsComponent
  ],
  declarations: [
    CompressorReplacementComponent,
    CompressorReplacementFormComponent,
    CompressorReplacementResultsComponent,
    CompressorReplacementHelpComponent,
    CompressorReplacementPlotComponent
  ],
  exports: [
    CompressorReplacementComponent
  ],
  providers: [
    CompressorReplacementService,
    CompressorCagiService,
    CompressorAdapterService,
    AltitudeCorrectionService,
    ConvertUnitsService,
    DecimalPipe
  ]
})
export class CompressorReplacementModule { }
