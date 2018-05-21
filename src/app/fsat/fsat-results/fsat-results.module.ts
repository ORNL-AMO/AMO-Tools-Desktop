import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatResultsPanelComponent } from './fsat-results-panel/fsat-results-panel.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [FsatResultsPanelComponent],
  exports: [FsatResultsPanelComponent]
})
export class FsatResultsModule { }
