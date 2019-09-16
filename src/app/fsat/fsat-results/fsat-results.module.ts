import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatResultsPanelComponent } from './fsat-results-panel/fsat-results-panel.component';
import { SharedModule } from '../../shared/shared.module';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PercentGraphModule
  ],
  declarations: [FsatResultsPanelComponent],
  exports: [FsatResultsPanelComponent]
})
export class FsatResultsModule { }
