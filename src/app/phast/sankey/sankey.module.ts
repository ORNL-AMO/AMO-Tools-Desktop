import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SankeyComponent } from './sankey.component';
import { SankeyService } from './sankey.service';
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SankeyComponent
  ],
  exports: [
    SankeyComponent
  ],
  providers: [
    SankeyService
  ]
})
export class SankeyModule { }
