import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorInventoryComponent } from './motor-inventory.component';
import { MotorInventoryBannerComponent } from './motor-inventory-banner/motor-inventory-banner.component';
import { RouterModule } from '@angular/router';
import { MotorInventorySetupComponent } from './motor-inventory-setup/motor-inventory-setup.component';
import { MotorCatalogComponent } from './motor-inventory-setup/motor-catalog/motor-catalog.component';
import { DepartmentSetupComponent } from './motor-inventory-setup/department-setup/department-setup.component';
import { PlantSetupComponent } from './motor-inventory-setup/plant-setup/plant-setup.component';
import { MotorInventoryCalculatorsComponent } from './motor-inventory-calculators/motor-inventory-calculators.component';
import { MotorInventorySummaryComponent } from './motor-inventory-summary/motor-inventory-summary.component';
import { BatchAnalysisComponent } from './batch-analysis/batch-analysis.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { SettingsModule } from '../settings/settings.module';
import { MotorInventoryService } from './motor-inventory.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MotorCatalogService } from './motor-inventory-setup/motor-catalog/motor-catalog.service';
import { DepartmentCatalogTableComponent } from './motor-inventory-setup/department-catalog-table/department-catalog-table.component';
import { SelectMotorModalComponent } from './motor-inventory-setup/motor-catalog/select-motor-modal/select-motor-modal.component';
import { ModalModule } from 'ngx-bootstrap';
import { MotorPropertiesComponent } from './motor-inventory-setup/motor-properties/motor-properties.component';
import { RequiredPropertiesComponent } from './motor-inventory-setup/motor-catalog/required-properties/required-properties.component';
import { OptionalPropertiesComponent } from './motor-inventory-setup/motor-catalog/optional-properties/optional-properties.component';
import { MotorBasicsComponent } from './motor-inventory-setup/motor-catalog/motor-basics/motor-basics.component';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { FilterMotorsComponent } from './motor-inventory-setup/motor-catalog/select-motor-modal/filter-motors/filter-motors.component';
import { MotorOptionsTableComponent } from './motor-inventory-setup/motor-catalog/select-motor-modal/motor-options-table/motor-options-table.component';
import { FilterMotorOptionsPipe } from './motor-inventory-setup/motor-catalog/select-motor-modal/filter-motor-options.pipe';
import { LoadCharacteristicPropertiesComponent } from './motor-inventory-setup/motor-properties/load-characteristic-properties/load-characteristic-properties.component';
import { ManualSpecificationPropertiesComponent } from './motor-inventory-setup/motor-properties/manual-specification-properties/manual-specification-properties.component';
import { NameplateDataPropertiesComponent } from './motor-inventory-setup/motor-properties/nameplate-data-properties/nameplate-data-properties.component';
import { OperationDataPropertiesComponent } from './motor-inventory-setup/motor-properties/operation-data-properties/operation-data-properties.component';
import { OtherPropertiesComponent } from './motor-inventory-setup/motor-properties/other-properties/other-properties.component';
import { PurchaseInformationPropertiesComponent } from './motor-inventory-setup/motor-properties/purchase-information-properties/purchase-information-properties.component';
import { TorquePropertiesComponent } from './motor-inventory-setup/motor-properties/torque-properties/torque-properties.component';
import { BatchAnalysisPropertiesComponent } from './motor-inventory-setup/motor-properties/batch-analysis-properties/batch-analysis-properties.component';

@NgModule({
  declarations: [
    MotorInventoryComponent,
    MotorInventoryBannerComponent,
    MotorInventorySetupComponent,
    MotorCatalogComponent,
    DepartmentSetupComponent,
    PlantSetupComponent,
    MotorInventoryCalculatorsComponent,
    MotorInventorySummaryComponent,
    BatchAnalysisComponent,
    HelpPanelComponent,
    DepartmentCatalogTableComponent,
    SelectMotorModalComponent,
    MotorPropertiesComponent,
    RequiredPropertiesComponent,
    OptionalPropertiesComponent,
    MotorBasicsComponent,
    FilterMotorsComponent,
    MotorOptionsTableComponent,
    FilterMotorOptionsPipe,
    LoadCharacteristicPropertiesComponent,
    ManualSpecificationPropertiesComponent,
    NameplateDataPropertiesComponent,
    OperationDataPropertiesComponent,
    OtherPropertiesComponent,
    PurchaseInformationPropertiesComponent,
    TorquePropertiesComponent,
    BatchAnalysisPropertiesComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    SharedPipesModule
  ],
  providers: [
    MotorInventoryService,
    MotorCatalogService
  ]
})
export class MotorInventoryModule { }
