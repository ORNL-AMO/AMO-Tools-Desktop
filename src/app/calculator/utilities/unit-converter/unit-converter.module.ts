import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitConverterService } from './unit-converter.service';
import { SortByPipe } from './sort-by.pipe';
import { UnitConverterComponent } from './unit-converter.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    UnitConverterComponent,
    SortByPipe
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    UnitConverterComponent
  ],
  providers: [
    UnitConverterService
  ]
})
export class UnitConverterModule { }
