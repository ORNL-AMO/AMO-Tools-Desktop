import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressorNamePipe } from './compressor-name.pipe';
import { CompressorTypePipe } from './compressor-type.pipe';
import { ControlTypePipe } from './control-type.pipe';
import { CompressorShowShutdownTimerPipe } from './compressor-show-shutdown-timer';
import { CompressorItemPipe } from './compressor-item.pipe';
import { AirflowValidationPipe } from './profile-table-validation-pipes/airflow-validation-pipe';
import { AmpsValidationPipe } from './profile-table-validation-pipes/amps-validation-pipe';
import { PercentPowerValidationPipe } from './profile-table-validation-pipes/percent-power-validation-pipe';
import { PowerFactorValidationPipe } from './profile-table-validation-pipes/power-factor-validation-pipe';
import { PowerValidationPipe } from './profile-table-validation-pipes/power-validation-pipe';
import { VoltsValidationPipe } from './profile-table-validation-pipes/volts-validation-pipe';
import { IsCompressorInvalidPipe } from './is-compressor-invalid-pipe';
import { PercentCapacityValidationPipe } from './profile-table-validation-pipes/percent-capacity-validation-pipe';
import { DayTypeNamePipe } from './day-type-name.pipe';



@NgModule({
  declarations: [
    CompressorNamePipe,
    CompressorTypePipe,
    ControlTypePipe,
    CompressorShowShutdownTimerPipe,
    CompressorItemPipe,
    AirflowValidationPipe,
    AmpsValidationPipe,
    PercentPowerValidationPipe,
    PowerFactorValidationPipe,
    PowerValidationPipe,
    VoltsValidationPipe,
    IsCompressorInvalidPipe,
    PercentCapacityValidationPipe,
    DayTypeNamePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CompressorNamePipe,
    CompressorTypePipe,
    ControlTypePipe,
    CompressorShowShutdownTimerPipe,
    CompressorItemPipe,
    AirflowValidationPipe,
    AmpsValidationPipe,
    PercentPowerValidationPipe,
    PowerFactorValidationPipe,
    PowerValidationPipe,
    VoltsValidationPipe,
    IsCompressorInvalidPipe,
    PercentCapacityValidationPipe,
    DayTypeNamePipe
  ]
})
export class SharedCompressorPipesModule { }
