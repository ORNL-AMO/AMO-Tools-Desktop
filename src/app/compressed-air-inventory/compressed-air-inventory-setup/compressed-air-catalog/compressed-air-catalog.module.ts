import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirCatalogComponent } from './compressed-air-catalog.component';
import { CompressedAirCatalogService } from './compressed-air-catalog.service';
import { NameplateDataCatalogComponent } from './nameplate-data-catalog/nameplate-data-catalog.component';
import { CompressedAirControlsCatalogComponent } from './compressed-air-controls-catalog/compressed-air-controls-catalog.component';
import { CompressedAirMotorCatalogComponent } from './compressed-air-motor-catalog/compressed-air-motor-catalog.component';
import { DesignDetailsCatalogComponent } from './design-details-catalog/design-details-catalog.component';
import { PerformancePointsCatalogComponent } from './performance-points-catalog/performance-points-catalog.component';
import { CompressedAirBasicsComponent } from './compressed-air-basics/compressed-air-basics.component';
import { CompressedAirBasicsService } from './compressed-air-basics/compressed-air-basics.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ConfirmDeleteModalModule } from '../../../shared/confirm-delete-modal/confirm-delete-modal.module';
import { ConnectedInventoryModule } from '../../../shared/connected-inventory/connected-inventory-module';
import { OperatingHoursModalModule } from '../../../shared/operating-hours-modal/operating-hours-modal.module';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { NameplateDataCatalogService } from './nameplate-data-catalog/nameplate-data-catalog.service';
import { CompressedAirMotorCatalogService } from './compressed-air-motor-catalog/compressed-air-motor-catalog.service';
import { CompressedAirControlsCatalogService } from './compressed-air-controls-catalog/compressed-air-controls-catalog.service';
import { DesignDetailsCatalogService } from './design-details-catalog/design-details-catalog.service';



@NgModule({
  declarations: [
    CompressedAirCatalogComponent,
    NameplateDataCatalogComponent,
    CompressedAirControlsCatalogComponent,
    CompressedAirMotorCatalogComponent,
    DesignDetailsCatalogComponent,
    PerformancePointsCatalogComponent,
    CompressedAirBasicsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    SharedPipesModule,
    OperatingHoursModalModule,
    ConfirmDeleteModalModule,
    ConnectedInventoryModule,
    RouterModule
  ],
  providers: [
    CompressedAirCatalogService,
    CompressedAirBasicsService,
    NameplateDataCatalogService,
    CompressedAirMotorCatalogService,
    CompressedAirControlsCatalogService,
    DesignDetailsCatalogService
  ],
  exports: [
    CompressedAirCatalogComponent
  ]
})
export class CompressedAirCatalogModule { }
