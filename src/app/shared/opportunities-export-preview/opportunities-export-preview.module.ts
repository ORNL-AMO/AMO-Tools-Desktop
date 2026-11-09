import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpportunitiesExportPreviewComponent } from './opportunities-export-preview.component';

@NgModule({
  declarations: [
    OpportunitiesExportPreviewComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    OpportunitiesExportPreviewComponent
  ]
})
export class OpportunitiesExportPreviewModule { }
