import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';
import { Co2HelpTextModule } from '../../../shared/co2-help-text/co2-help-text.module';
import { AtmosphereLossesHelpComponent } from './atmosphere-losses-help/atmosphere-losses-help.component';
import { ChargeMaterialHelpComponent } from './charge-material-help/charge-material-help.component';
import { CoolingLossesHelpComponent } from './cooling-losses-help/cooling-losses-help.component';
import { ExtendedSurfaceLossesHelpComponent } from './extended-surface-losses-help/extended-surface-losses-help.component';
import { FixtureLossesHelpComponent } from './fixture-losses-help/fixture-losses-help.component';
import { FlueGasLossesHelpComponent } from './flue-gas-losses-help/flue-gas-losses-help.component';
import { GasLeakageLossesHelpComponent } from './gas-leakage-losses-help/gas-leakage-losses-help.component';
import { OpeningLossesHelpComponent } from './opening-losses-help/opening-losses-help.component';
import { OtherLossesHelpComponent } from './other-losses-help/other-losses-help.component';
import { WallLossesHelpComponent } from './wall-losses-help/wall-losses-help.component';
import { AuxiliaryPowerLossesHelpComponent } from './auxiliary-power-losses-help/auxiliary-power-losses-help.component';
import { SlagHelpComponent } from './slag-help/slag-help.component';
import { ExhaustGasHelpComponent } from './exhaust-gas-help/exhaust-gas-help.component';
import { EnergyInputHelpComponent } from './energy-input-help/energy-input-help.component';
import { EnergyInputExhaustGasLossesHelpComponent } from './energy-input-exhaust-gas-losses-help/energy-input-exhaust-gas-losses-help.component';
import { HeatSystemEfficiencyHelpComponent } from './heat-system-efficiency-help/heat-system-efficiency-help.component';
import { OperationsHelpComponent } from './operations-help/operations-help.component';

const HELP_COMPONENTS = [
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
  EnergyInputHelpComponent,
  EnergyInputExhaustGasLossesHelpComponent,
  HeatSystemEfficiencyHelpComponent,
  OperationsHelpComponent,
];

@NgModule({
  imports: [CommonModule, ModalModule, Co2HelpTextModule],
  declarations: HELP_COMPONENTS,
  exports: HELP_COMPONENTS,
})
export class LossesHelpModule {}
