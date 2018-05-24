import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatResultsPanelComponent } from './fsat-results-panel/fsat-results-panel.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [FsatResultsPanelComponent],
  exports: [FsatResultsPanelComponent]
})
export class FsatResultsModule { }
