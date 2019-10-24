import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterfallGraphComponent } from './waterfall-graph.component';
import { WaterfallGraphService } from './waterfall-graph.service';



@NgModule({
  declarations: [
    WaterfallGraphComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WaterfallGraphComponent
  ],
  providers: [
    WaterfallGraphService
  ]
})
export class WaterfallGraphModule { }
