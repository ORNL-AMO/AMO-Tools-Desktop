import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreasureChestMenuComponent } from './treasure-chest-menu.component';
import { TreasureChestMenuService } from './treasure-chest-menu.service';
import { ImportOpportunitiesComponent } from '../import-opportunities/import-opportunities.component';
import { ExportOpportunitiesComponent } from '../export-opportunities/export-opportunities.component';
import { ImportOpportunitiesService } from '../import-opportunities.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { UtilityTypeDropdownComponent } from './utility-type-dropdown/utility-type-dropdown.component';
import { CalculatorTypeDropdownComponent } from './calculator-type-dropdown/calculator-type-dropdown.component';
import { TeamsDropdownComponent } from './teams-dropdown/teams-dropdown.component';
import { EquipmentsDropdownComponent } from './equipments-dropdown/equipments-dropdown.component';

@NgModule({
  declarations: [
    TreasureChestMenuComponent,
    ImportOpportunitiesComponent,
    ExportOpportunitiesComponent,
    UtilityTypeDropdownComponent,
    CalculatorTypeDropdownComponent,
    TeamsDropdownComponent,
    EquipmentsDropdownComponent
  ],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule
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
