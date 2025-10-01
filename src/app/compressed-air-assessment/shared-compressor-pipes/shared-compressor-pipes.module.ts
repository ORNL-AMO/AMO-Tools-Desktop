import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressorNamePipe } from './compressor-name.pipe';
import { CompressorTypePipe } from './compressor-type.pipe';
import { ControlTypePipe } from './control-type.pipe';
import { CompressorShowShutdownTimerPipe } from './compressor-show-shutdown-timer';



@NgModule({
  declarations: [
    CompressorNamePipe,
    CompressorTypePipe,
    ControlTypePipe,
    CompressorShowShutdownTimerPipe
  ],
  imports: [
    CommonModule
  ],
  exports:[
    CompressorNamePipe,
    CompressorTypePipe,
    ControlTypePipe,
    CompressorShowShutdownTimerPipe
  ]
})
export class SharedCompressorPipesModule { }
