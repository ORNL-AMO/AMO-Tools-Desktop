import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SankeyDiagramComponent } from './sankey-diagram/sankey-diagram.component';
import { SankeyComponent } from './sankey.component';

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
  ]
})
export class SankeyModule { }
