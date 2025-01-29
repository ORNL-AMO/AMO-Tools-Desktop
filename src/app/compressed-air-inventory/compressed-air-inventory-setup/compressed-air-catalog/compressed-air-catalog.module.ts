import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompressedAirCatalogComponent } from './compressed-air-catalog.component';
import { CompressedAirCatalogService } from './compressed-air-catalog.service';
import { NameplateDataCatalogComponent } from './nameplate-data-catalog/nameplate-data-catalog.component';
import { CompressedAirControlsCatalogComponent } from './compressed-air-controls-catalog/compressed-air-controls-catalog.component';
import { CompressedAirMotorCatalogComponent } from './compressed-air-motor-catalog/compressed-air-motor-catalog.component';
import { DesignDetailsCatalogComponent } from './design-details-catalog/design-details-catalog.component';
import { PerformancePointsCatalogComponent } from './performance-points-catalog/performance-points-catalog.component';



@NgModule({
  declarations: [
    CompressedAirCatalogComponent,
    NameplateDataCatalogComponent,
    CompressedAirControlsCatalogComponent,
    CompressedAirMotorCatalogComponent,
    DesignDetailsCatalogComponent,
    PerformancePointsCatalogComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    CompressedAirCatalogService
  ],
  exports: [
    CompressedAirCatalogComponent
  ]
})
export class CompressedAirCatalogModule { }
