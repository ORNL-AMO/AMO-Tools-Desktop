import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasureChestMenuComponent } from './treasure-chest-menu.component';
import { TreasureChestMenuService } from './treasure-chest-menu.service';
import { ImportOpportunitiesComponent } from '../import-opportunities/import-opportunities.component';
import { ExportOpportunitiesComponent } from '../export-opportunities/export-opportunities.component';
import { ImportOpportunitiesService } from '../import-opportunities.service';

@NgModule({
  declarations: [
    TreasureChestMenuComponent,
    ImportOpportunitiesComponent,
    ExportOpportunitiesComponent
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    TreasureChestMenuService,
    ImportOpportunitiesService
  ],
  exports: [
    TreasureChestMenuComponent
  ]
})
export class TreasureChestMenuModule { }
