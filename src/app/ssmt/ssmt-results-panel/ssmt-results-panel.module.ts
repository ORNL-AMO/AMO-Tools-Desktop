import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtResultsPanelComponent } from './ssmt-results-panel/ssmt-results-panel.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    SsmtResultsPanelComponent
  ],
  exports: [
    SsmtResultsPanelComponent
  ]
})
export class SsmtResultsPanelModule { }
