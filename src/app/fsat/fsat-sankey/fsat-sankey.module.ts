import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FsatSankeyComponent } from './fsat-sankey.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    FsatSankeyComponent
  ],
  exports: [
    FsatSankeyComponent
  ]
})
export class FsatSankeyModule { }
