import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessCoolingListComponent } from './process-cooling-list/process-cooling-list.component';
import { CoolingTowerModule } from './cooling-tower/cooling-tower.module';
import { RouterModule } from '@angular/router';
import { ChillerService } from './chiller.service';
import { FanPsychrometricModule } from './fan-psychrometric/fan-psychrometric.module';
import { ChillerPerformanceModule } from './chiller-performance/chiller-performance.module';
import { ChillerStagingModule } from './chiller-staging/chiller-staging.module';


@NgModule({
  declarations: [
    ProcessCoolingListComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    CoolingTowerModule,
    ChillerPerformanceModule,
    ChillerStagingModule,
    FanPsychrometricModule
  ],
  exports: [
    ProcessCoolingListComponent
  ],
  providers: [
    ChillerService
  ]
})

export class ProcessCoolingModule { }
