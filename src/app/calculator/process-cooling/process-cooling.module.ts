import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessCoolingListComponent } from './process-cooling-list/process-cooling-list.component';
import { CoolingTowerModule } from './cooling-tower/cooling-tower.module';
import { RouterModule } from '@angular/router';
import { ChillerService } from './chiller.service';


@NgModule({
  declarations: [
    ProcessCoolingListComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    CoolingTowerModule
  ],
  exports: [
    ProcessCoolingListComponent
  ],
  providers: [
    ChillerService
  ]
})
export class ProcessCoolingModule { }
