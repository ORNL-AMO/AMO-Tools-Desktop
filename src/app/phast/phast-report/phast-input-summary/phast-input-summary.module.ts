import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhastInputSummaryComponent } from './phast-input-summary.component';
import { AtmosphereSummaryComponent } from './atmosphere-summary/atmosphere-summary.component';
import { AuxiliaryPowerSummaryComponent } from './auxiliary-power-summary/auxiliary-power-summary.component';
import { ChargeMaterialSummaryComponent } from './charge-material-summary/charge-material-summary.component';
import { CoolingSummaryComponent } from './cooling-summary/cooling-summary.component';
import { EnergyInputSummaryComponent } from './energy-input-summary/energy-input-summary.component';
import { EnergyInputExhaustGasSummaryComponent } from './energy-input-exhaust-gas-summary/energy-input-exhaust-gas-summary.component';
import { ExhaustGasSummaryComponent } from './exhaust-gas-summary/exhaust-gas-summary.component';
import { ExtendedSurfaceSummaryComponent } from './extended-surface-summary/extended-surface-summary.component';
import { FixtureSummaryComponent } from './fixture-summary/fixture-summary.component';
import { FlueGasSummaryComponent } from './flue-gas-summary/flue-gas-summary.component';
import { GasLeakageSummaryComponent } from './gas-leakage-summary/gas-leakage-summary.component';
import { SystemEfficiencySummaryComponent } from './system-efficiency-summary/system-efficiency-summary.component';
import { OpeningSummaryComponent } from './opening-summary/opening-summary.component';
import { OtherSummaryComponent } from './other-summary/other-summary.component';
import { SlagSummaryComponent } from './slag-summary/slag-summary.component';
import { WallSummaryComponent } from './wall-summary/wall-summary.component';
import { OperationDataComponent } from './operation-data/operation-data.component';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';

@NgModule({
  imports: [
    CommonModule,
    ExportableResultsTableModule
  ],
  declarations: [
    PhastInputSummaryComponent,
    AtmosphereSummaryComponent,
    AuxiliaryPowerSummaryComponent,
    ChargeMaterialSummaryComponent,
    CoolingSummaryComponent,
    EnergyInputSummaryComponent,
    EnergyInputExhaustGasSummaryComponent,
    ExhaustGasSummaryComponent,
    ExtendedSurfaceSummaryComponent,
    FixtureSummaryComponent,
    FlueGasSummaryComponent,
    GasLeakageSummaryComponent,
    SystemEfficiencySummaryComponent,
    OpeningSummaryComponent,
    OtherSummaryComponent,
    SlagSummaryComponent,
    WallSummaryComponent,
    OperationDataComponent
  ],
  exports: [
    PhastInputSummaryComponent
  ]
})
export class PhastInputSummaryModule { }
