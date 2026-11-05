import { Type } from '@angular/core';
import { Losses, Notes } from '../models/phast';
import { HeatingEquipmentConfiguration } from '../models/views';
import { ChargeMaterialOpportunityComponent } from './charge-material-opportunity/charge-material-opportunity.component';
import { WallLossOpportunityComponent } from './wall-loss-opportunity/wall-loss-opportunity.component';
import { AtmosphereOpportunityComponent } from './atmosphere-opportunity/atmosphere-opportunity.component';
import { FixtureMaterialsHandlingOpportunityComponent } from './fixture-materials-handling-opportunity/fixture-materials-handling-opportunity.component';
import { FixtureCoolingOpportunityComponent } from './fixture-cooling-opportunity/fixture-cooling-opportunity.component';
import { CoolingOpportunityComponent } from './cooling-opportunity/cooling-opportunity.component';
import { OpeningSizeOpportunityComponent } from './opening-size-opportunity/opening-size-opportunity.component';
import { OpeningEmissivityOpportunityComponent } from './opening-emissivity-opportunity/opening-emissivity-opportunity.component';
import { OpeningTimeOpenOpportunityComponent } from './opening-time-open-opportunity/opening-time-open-opportunity.component';
import { GasLeakageOpportunityComponent } from './gas-leakage-opportunity/gas-leakage-opportunity.component';
import { AirFuelRatioOpportunityComponent } from './air-fuel-ratio-opportunity/air-fuel-ratio-opportunity.component';
import { PreheatCombustionAirOpportunityComponent } from './preheat-combustion-air-opportunity/preheat-combustion-air-opportunity.component';
import { OperationsOpportunityComponent } from './operations-opportunity/operations-opportunity.component';
import { SlagOpportunityComponent } from './slag-opportunity/slag-opportunity.component';
import { HeatSystemEfficiencyOpportunityComponent } from './heat-system-efficiency-opportunity/heat-system-efficiency-opportunity.component';

export interface OpportunityRegistration {
  component: Type<unknown>;
  /** Renders only for these heating equipment configurations; omit to render for all. */
  heatingEquipmentConfigurations?: readonly HeatingEquipmentConfiguration[];
}

export interface OpportunityRegistryEntry {
  /** Opportunities render only while the baseline has at least one loss of this type; omit for a non-loss opportunity that always renders. */
  lossKey?: keyof Losses;
  /** Notes field edited while focus is inside this entry's opportunities. */
  notesKey: keyof Notes;
  /** Rendered in array order. */
  opportunityComponents: OpportunityRegistration[];
}

const FUEL_FIRED_ONLY = [HeatingEquipmentConfiguration.FUEL_FIRED];
const ELECTROTECHNOLOGY_EAF_ONLY = [HeatingEquipmentConfiguration.ELECTROTECHNOLOGY_EAF];
const STEAM_CUSTOM_ONLY = [HeatingEquipmentConfiguration.STEAM, HeatingEquipmentConfiguration.CUSTOM_ELECTROTECHNOLOGY];

/**
 * Opportunities shown in the Explore Opportunities shell, in render order.
 *
 * To add an opportunity:
 * 1. Create the opportunity component and declare it in `process-heating-assessment.module.ts`.
 * 2. Add `{ component }` to `opportunityComponents` of the entry for its loss type, or add a new entry for a new loss type (or one without `lossKey` for a non-loss opportunity).
 * 3. Set `heatingEquipmentConfigurations` on the registration if it applies to only some configurations.
 * The shell template needs no change.
 */
export const OPPORTUNITY_REGISTRY: readonly OpportunityRegistryEntry[] = [
  { lossKey: 'chargeMaterials', notesKey: 'chargeNotes', opportunityComponents: [{ component: ChargeMaterialOpportunityComponent }] },
  { lossKey: 'wallLosses', notesKey: 'wallNotes', opportunityComponents: [{ component: WallLossOpportunityComponent }] },
  { lossKey: 'atmosphereLosses', notesKey: 'atmosphereNotes', opportunityComponents: [{ component: AtmosphereOpportunityComponent }] },
  { lossKey: 'fixtureLosses', notesKey: 'fixtureNotes', opportunityComponents: [{ component: FixtureMaterialsHandlingOpportunityComponent }, { component: FixtureCoolingOpportunityComponent }] },
  { lossKey: 'coolingLosses', notesKey: 'coolingNotes', opportunityComponents: [{ component: CoolingOpportunityComponent }] },
  { lossKey: 'openingLosses', notesKey: 'openingNotes', opportunityComponents: [{ component: OpeningSizeOpportunityComponent }, { component: OpeningEmissivityOpportunityComponent }, { component: OpeningTimeOpenOpportunityComponent }] },
  { lossKey: 'leakageLosses', notesKey: 'leakageNotes', opportunityComponents: [{ component: GasLeakageOpportunityComponent, heatingEquipmentConfigurations: FUEL_FIRED_ONLY }] },
  { lossKey: 'flueGasLosses', notesKey: 'flueGasNotes', opportunityComponents: [{ component: AirFuelRatioOpportunityComponent, heatingEquipmentConfigurations: FUEL_FIRED_ONLY }, { component: PreheatCombustionAirOpportunityComponent, heatingEquipmentConfigurations: FUEL_FIRED_ONLY }] },
  { lossKey: 'slagLosses', notesKey: 'slagNotes', opportunityComponents: [{ component: SlagOpportunityComponent, heatingEquipmentConfigurations: ELECTROTECHNOLOGY_EAF_ONLY }] },
  { notesKey: 'operationsNotes', opportunityComponents: [{ component: OperationsOpportunityComponent }] },
  { notesKey: 'heatSystemEfficiencyNotes', opportunityComponents: [{ component: HeatSystemEfficiencyOpportunityComponent, heatingEquipmentConfigurations: STEAM_CUSTOM_ONLY }] },
];
