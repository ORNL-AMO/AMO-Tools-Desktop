import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatResultsPanelComponent } from './fsat-results-panel/fsat-results-panel.component';
import { PercentGraphModule } from '../../shared/percent-graph/percent-graph.module';

@NgModule({
  imports: [
    CommonModule,
    PercentGraphModule
  ],
  declarations: [FsatResultsPanelComponent],
  exports: [FsatResultsPanelComponent]
})
export class FsatResultsModule { }
