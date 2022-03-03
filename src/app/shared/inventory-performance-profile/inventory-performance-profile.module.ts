import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryPerformanceProfileComponent } from './inventory-performance-profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import { SharedPipesModule } from '../shared-pipes/shared-pipes.module';



@NgModule({
  declarations: [
    InventoryPerformanceProfileComponent
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
    InventoryPerformanceProfileComponent
   ]
})
export class InventoryPerformanceProfileModule { }
