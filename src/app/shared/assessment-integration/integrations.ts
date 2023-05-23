import { MotorItem } from "../../motor-inventory/motor-inventory";
import { PumpItem } from "../../pump-inventory/pump-inventory";

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
  status: IntegrationStatusString,
  msgHTML?: string,
}

export interface ConnectedItem {
  id: string,
  name: string,
  inventoryId: number,
  inventoryName?: string,
  departmentId: string,
  inventoryType?: InventoryType,
}

export interface ConnectedInventoryData {
  connectedItem?: ConnectedItem,
  ownerItemId?: string;
  ownerInventoryId?: number;
  canConnect?: boolean,
  isConnected?: boolean,
  shouldConvertItemUnits?: boolean,
  shouldDisconnect?: boolean
}

export interface AssessmentOption {
  id: number,
  display: string
}


export type IntegrationStatusString = 'success' | 'settings-differ' | 'connected-items';
export type InventoryType = 'motor' | 'pump';