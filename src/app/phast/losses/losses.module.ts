import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ModalModule } from 'ngx-bootstrap';

import { WallLossesModule } from './wall-losses/wall-losses.module';
import { SlagModule } from './slag/slag.module';
import { OtherLossesModule } from './other-losses/other-losses.module';
import { OpeningLossesModule } from './opening-losses/opening-losses.module';
import { GasLeakageLossesModule } from './gas-leakage-losses/gas-leakage-losses.module';
import { FlueGasLossesModule } from './flue-gas-losses/flue-gas-losses.module';
import { FixtureLossesModule } from "./fixture-losses/fixture-losses.module";
import { ExtendedSurfaceLossesModule } from './extended-surface-losses/extended-surface-losses.module';
import { EnergyInputModule } from "./energy-input/energy-input.module";
import { AuxiliaryPowerLossesModule } from './auxiliary-power-losses/auxiliary-power-losses.module';
import { AtmosphereLossesModule } from "./atmosphere-losses/atmosphere-losses.module";

import { LossesComponent } from './losses.component';
import { ChargeMaterialComponent } from './charge-material/charge-material.component';
import { LossesSidebarComponent } from './losses-sidebar/losses-sidebar.component';

import { SolidChargeMaterialFormComponent } from './charge-material/solid-charge-material-form/solid-charge-material-form.component';
import { WaterCoolingLossesFormComponent } from './cooling-losses/water-cooling-losses-form/water-cooling-losses-form.component';
import { LiquidChargeMaterialFormComponent } from './charge-material/liquid-charge-material-form/liquid-charge-material-form.component';
import { GasChargeMaterialFormComponent } from './charge-material/gas-charge-material-form/gas-charge-material-form.component';

import { ChargeMaterialService } from './charge-material/charge-material.service';

import { LossesTabsComponent } from './losses-tabs/losses-tabs.component';

import { CoolingLossesComponent } from './cooling-losses/cooling-losses.component';
import { CoolingLossesService } from './cooling-losses/cooling-losses.service';
import { GasCoolingLossesFormComponent } from './cooling-losses/gas-cooling-losses-form/gas-cooling-losses-form.component';
import { LiquidCoolingLossesFormComponent } from './cooling-losses/liquid-cooling-losses-form/liquid-cooling-losses-form.component';

import { NotesComponent } from './notes/notes.component';
import { LossesHelpComponent } from './losses-help/losses-help.component';
import { AtmosphereLossesHelpComponent } from './losses-help/atmosphere-losses-help/atmosphere-losses-help.component';
import { ChargeMaterialHelpComponent } from './losses-help/charge-material-help/charge-material-help.component';
import { CoolingLossesHelpComponent } from './losses-help/cooling-losses-help/cooling-losses-help.component';
import { ExtendedSurfaceLossesHelpComponent } from './losses-help/extended-surface-losses-help/extended-surface-losses-help.component';
import { FixtureLossesHelpComponent } from './losses-help/fixture-losses-help/fixture-losses-help.component';
import { FlueGasLossesHelpComponent } from './losses-help/flue-gas-losses-help/flue-gas-losses-help.component';
import { GasLeakageLossesHelpComponent } from './losses-help/gas-leakage-losses-help/gas-leakage-losses-help.component';
import { OpeningLossesHelpComponent } from './losses-help/opening-losses-help/opening-losses-help.component';
import { OtherLossesHelpComponent } from './losses-help/other-losses-help/other-losses-help.component';
import { WallLossesHelpComponent } from './losses-help/wall-losses-help/wall-losses-help.component';
import { SuiteDbModule } from '../../suiteDb/suiteDb.module';
import { ExhaustGasComponent } from './exhaust-gas/exhaust-gas.component';

import { HeatStorageComponent } from './heat-storage/heat-storage.component';
import { AuxiliaryPowerLossesHelpComponent } from './losses-help/auxiliary-power-losses-help/auxiliary-power-losses-help.component';
import { HeatStorageHelpComponent } from './losses-help/heat-storage-help/heat-storage-help.component';
import { SlagHelpComponent } from './losses-help/slag-help/slag-help.component';
import { ExhaustGasHelpComponent } from './losses-help/exhaust-gas-help/exhaust-gas-help.component';
import { EditConditionPropertiesComponent } from './edit-condition-properties/edit-condition-properties.component';

import { EnergyInputHelpComponent } from './losses-help/energy-input-help/energy-input-help.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ModalModule,
    SuiteDbModule,
    WallLossesModule,
    SlagModule,
    OtherLossesModule,
    OpeningLossesModule,
    GasLeakageLossesModule,
    FlueGasLossesModule,
    FixtureLossesModule,
    ExtendedSurfaceLossesModule,
    EnergyInputModule,
    AuxiliaryPowerLossesModule,
    AtmosphereLossesModule
  ],
  declarations: [
    LossesComponent,
    ChargeMaterialComponent,
    LossesSidebarComponent,
    WaterCoolingLossesFormComponent,
    LiquidChargeMaterialFormComponent,
    GasChargeMaterialFormComponent,
    SolidChargeMaterialFormComponent,
    LossesTabsComponent,
    CoolingLossesComponent,
    GasCoolingLossesFormComponent,
    LiquidCoolingLossesFormComponent,
    NotesComponent,
    LossesHelpComponent,
    AtmosphereLossesHelpComponent,
    ChargeMaterialHelpComponent,
    CoolingLossesHelpComponent,
    ExtendedSurfaceLossesHelpComponent,
    FixtureLossesHelpComponent,
    FlueGasLossesHelpComponent,
    GasLeakageLossesHelpComponent,
    OpeningLossesHelpComponent,
    OtherLossesHelpComponent,
    WallLossesHelpComponent,
    ExhaustGasComponent,
    HeatStorageComponent,
    AuxiliaryPowerLossesHelpComponent,
    HeatStorageHelpComponent,
    SlagHelpComponent,
    ExhaustGasHelpComponent,
    EditConditionPropertiesComponent,
    EnergyInputHelpComponent
  ],
  providers: [
    ChargeMaterialService,
    CoolingLossesService
  ],
  exports: [
    LossesComponent
  ]
})
export class LossesModule { }
