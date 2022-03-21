import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PhastSankeyComponent } from './phast-sankey.component';
import { InvalidPhastModule } from '../../phast/invalid-phast/invalid-phast.module';
import { SankeyService } from './sankey.service';



@NgModule({
  declarations: [PhastSankeyComponent],
  imports: [
    CommonModule,
    InvalidPhastModule
  ],
  exports: [
    PhastSankeyComponent
  ],
  providers: [
    DecimalPipe,
    SankeyService
  ]
})
export class PhastSankeyModule { }
