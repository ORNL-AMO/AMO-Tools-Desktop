import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CentrifugalGraphComponent } from './centrifugal-graph.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';



@NgModule({
  declarations: [
    CentrifugalGraphComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    NgbModule,
    SharedPipesModule
  ],
  exports: [
    CentrifugalGraphComponent
  ]
})
export class CentrifugalGraphModule { }
