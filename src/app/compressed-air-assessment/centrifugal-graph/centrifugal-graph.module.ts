import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CentrifugalGraphComponent } from './centrifugal-graph.component';
import { CentrifugalGraphService } from './centrifugal-graph.service';
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
  providers: [
    CentrifugalGraphService
  ],
  exports: [
    CentrifugalGraphComponent
  ]
})
export class CentrifugalGraphModule { }
