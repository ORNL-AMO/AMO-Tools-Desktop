import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtResultsPanelComponent } from './ssmt-results-panel/ssmt-results-panel.component';
import { SharedModule } from '../../shared/shared.module';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PercentGraphModule
  ],
  declarations: [
    SsmtResultsPanelComponent
  ],
  exports: [
    SsmtResultsPanelComponent
  ]
})
export class SsmtResultsPanelModule { }
