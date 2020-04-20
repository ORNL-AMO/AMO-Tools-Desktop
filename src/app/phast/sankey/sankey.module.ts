import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SankeyComponent } from './sankey.component';
import { SankeyService } from './sankey.service';
import { InvalidPhastModule } from '../invalid-phast/invalid-phast.module';

@NgModule({
  imports: [
    CommonModule,
    InvalidPhastModule
  ],
  declarations: [
    SankeyComponent,
  ],
  exports: [
    SankeyComponent
  ],
  providers: [
    SankeyService
  ]
})
export class SankeyModule { }
