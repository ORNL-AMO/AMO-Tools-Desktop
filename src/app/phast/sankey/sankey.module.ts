import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SankeyDiagramComponent } from './sankey-diagram/sankey-diagram.component';
import { SankeyComponent } from './sankey.component';
import { SankeyService } from './sankey.service';
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SankeyDiagramComponent,
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
