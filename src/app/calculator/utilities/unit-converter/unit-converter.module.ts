import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitConverterService } from './unit-converter.service';
import { UnitConverterComponent } from './unit-converter.component';
import { FormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  declarations: [
    UnitConverterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedPipesModule
  ],
  exports: [
    UnitConverterComponent
  ],
  providers: [
    UnitConverterService
  ]
})
export class UnitConverterModule { }
