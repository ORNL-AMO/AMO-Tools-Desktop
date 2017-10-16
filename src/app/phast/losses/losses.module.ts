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
import { CoolingLossesModule } from "./cooling-losses/cooling-losses.module";
import { ChargeMaterialModule } from './charge-material/charge-material.module';

import { LossesComponent } from './losses.component';
import { LossesSidebarComponent } from './losses-sidebar/losses-sidebar.component';
import { LossesTabsComponent } from './losses-tabs/losses-tabs.component';

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

import { AuxiliaryPowerLossesHelpComponent } from './losses-help/auxiliary-power-losses-help/auxiliary-power-losses-help.component';
import { SlagHelpComponent } from './losses-help/slag-help/slag-help.component';
import { ExhaustGasHelpComponent } from './losses-help/exhaust-gas-help/exhaust-gas-help.component';
import { EditConditionPropertiesComponent } from './edit-condition-properties/edit-condition-properties.component';

import { EnergyInputHelpComponent } from './losses-help/energy-input-help/energy-input-help.component';

import { ExhaustGasModule } from './exhaust-gas/exhaust-gas.module';
import { LossesService } from './losses.service';
import { EnergyInputExhaustGasLossesModule } from './energy-input-exhaust-gas-losses/energy-input-exhaust-gas-losses.module';
import { EnergyInputExhaustGasLossesHelpComponent } from './losses-help/energy-input-exhaust-gas-losses-help/energy-input-exhaust-gas-losses-help.component';
import { HeatSystemEfficiencyModule } from './heat-system-efficiency/heat-system-efficiency.module';
import { HeatSystemEfficiencyHelpComponent } from './losses-help/heat-system-efficiency-help/heat-system-efficiency-help.component';
import { OperationsModule } from './operations/operations.module';
import { OperationsHelpComponent } from './losses-help/operations-help/operations-help.component';
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
    AtmosphereLossesModule,
    CoolingLossesModule,
    ChargeMaterialModule,
    ExhaustGasModule,
    EnergyInputExhaustGasLossesModule,
    OperationsModule,
    HeatSystemEfficiencyModule
  ],
  declarations: [
    LossesComponent,
    LossesSidebarComponent,
    LossesTabsComponent,
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
    AuxiliaryPowerLossesHelpComponent,
    SlagHelpComponent,
    ExhaustGasHelpComponent,
    EditConditionPropertiesComponent,
    EnergyInputHelpComponent,
    EnergyInputExhaustGasLossesHelpComponent,
    HeatSystemEfficiencyHelpComponent,
    OperationsHelpComponent
  ],
  providers: [
    LossesService
  ],
  exports: [
    LossesComponent
  ]
})
export class LossesModule { }
