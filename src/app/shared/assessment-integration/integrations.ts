import { FluidProperties, PumpMotorProperties, PumpProperties, SystemProperties } from "../../pump-inventory/pump-inventory";
import { PsatInputs } from "../models/psat";

export interface InventorySelectOptions {
  label: string,
  itemName: string,
  inventoryOptions: Array<InventoryOption>,
  catalogItemOptions?: Array<CatalogItemOptions>,
  shouldResetForm?: boolean;
}

export interface InventoryOption {
  id: number,
  display: string,
  catalogItemOptions: CatalogItemOptions[];
}

export interface CatalogItemOptions {
  department: string,
  catalog: Array<any>;
}

export interface IntegrationState {
  status?: IntegrationStatusString,
  assessmentIntegrationStatus?: IntegrationStatusString | AssessmentStatusString,
  differingConnectedValues?: Array<ConnectedValueFormField>,
  msgHTML?: string,
}

export interface ConnectedValueFormField {
  formGroup: IntegrationFormGroupString,
}

export interface ConnectedItem {
  id?: string,
  name: string,
  inventoryId: number,
  inventoryName?: string,
  departmentId?: string,
  inventoryType?: InventoryType,
  assessmentType?: AssessmentType,
  assessmentId?: number,
  assessmentName?: string,
  connectedFromState?: ConnectedFromState
}

// inventory values at time of assessment filled/connected
export interface ConnectedFromState {
  psatInputs?: PsatInputs;
  pumpMotor: PumpMotorProperties,
  pumpEquipment: PumpProperties,
  pumpSystem: SystemProperties,
  pumpFluid: FluidProperties
}

export interface ConnectedInventoryData {
  connectedItem?: ConnectedItem,
  ownerItemId?: string;
  ownerInventoryId?: number;
  ownerAssessmentId?: number;
  canConnect?: boolean,
  isConnected?: boolean,
  shouldConvertItemUnits?: boolean,
  shouldRestoreConnectedValues?: boolean,
  shouldDisconnect?: boolean
}

export interface AssessmentOption {
  id: number,
  display: string
}


export type IntegrationStatusString = 'settings-differ' | 'connected-to-inventory';
export type AssessmentStatusString = 'connected-to-assessment' | 'connected-assessment-differs' | 'three-way-connected' | 'invalid';
export type InventoryType = 'motor' | 'pump';
// Do we have this anywhere else? create intern issue to force existing assessment.types throughout app to use type

export type AssessmentType = 'PSAT' | 'PHAST' | 'FSAT' | 'SSMT' | 'TreasureHunt' | 'WasteWater' | 'CompressedAir';
// export type AssessmentType = 'psat';
export type IntegrationFormGroupString = 'fluid' | 'pump' | 'motor' | 'system';