import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtResultsPanelComponent } from './ssmt-results-panel/ssmt-results-panel.component';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    PercentGraphModule,
    SharedPipesModule
  ],
  declarations: [
    SsmtResultsPanelComponent
  ],
  exports: [
    SsmtResultsPanelComponent
  ]
})
export class SsmtResultsPanelModule { }
