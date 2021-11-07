import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressorNamePipe } from './compressor-name.pipe';
import { CompressorTypePipe } from './compressor-type.pipe';
import { ControlTypePipe } from './control-type.pipe';



@NgModule({
  declarations: [
    CompressorNamePipe,
    CompressorTypePipe,
    ControlTypePipe
  ],
  imports: [
    CommonModule
  ],
  exports:[
    CompressorNamePipe,
    CompressorTypePipe,
    ControlTypePipe
  ]
})
export class SharedCompressorPipesModule { }
