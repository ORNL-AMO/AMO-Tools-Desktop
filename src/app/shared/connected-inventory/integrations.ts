import { CentrifugalSpecifics, CompressedAirControlsProperties, CompressedAirDesignDetailsProperties, CompressedAirMotorProperties, CompressedAirPerformancePointsProperties, FieldMeasurements, NameplateData } from "../../compressed-air-inventory/compressed-air-inventory";
import { FluidProperties, PumpMotorProperties, PumpProperties, SystemProperties } from "../../pump-inventory/pump-inventory";
import { AssessmentType } from "../models/assessment";
import { CompressedAirAssessment } from "../models/compressed-air-assessment";
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
  connectedAssessmentStatus?: IntegrationStatusString | AssessmentStatusString,
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
  connectedPumpFromState?: ConnectedPumpFromState,
  connectedCompressorFromState?: ConnectedCompressorFromState,
}

// inventory values at time of assessment filled/connected
export interface ConnectedPumpFromState {
  psatInputs?: PsatInputs;
  pumpMotor: PumpMotorProperties,
  pumpEquipment: PumpProperties,
  pumpSystem: SystemProperties,
  pumpFluid: FluidProperties,
}

export interface ConnectedCompressorFromState {
  compressedAirAssessment?: CompressedAirAssessment,
  compressorMotor: CompressedAirMotorProperties,
  nameplateData: NameplateData,
  compressedAirControlsProperties: CompressedAirControlsProperties,
  compressedAirDesignDetailsProperties: CompressedAirDesignDetailsProperties,
  compressedAirPerformancePointsProperties: CompressedAirPerformancePointsProperties,
  centrifugalSpecifics: CentrifugalSpecifics,  
  fieldMeasurements: FieldMeasurements,
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
export type InventoryType = 'motor' | 'pump' | 'compressed-air';
export type IntegrationFormGroupString = 'fluid' | 'pump' | 'motor' | 'system' | 'compressed-air';