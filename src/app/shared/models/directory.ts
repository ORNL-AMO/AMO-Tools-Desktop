import { Assessment } from './assessment';
import { Calculator } from './calculators';
import { TreasureHunt } from './treasure-hunt';
import { InventoryItem } from './inventory/inventory';
import { Diagram } from './app';
export interface Directory {
  name: string;
  assessments?: Assessment[];
  subDirectory?: Directory[],
  calculators?:  Calculator[],
  inventories?: InventoryItem[],
  diagrams?: Diagram[],
  collapsed?: boolean,
  createdDate?: Date,
  modifiedDate?: Date,
  id?: number,
  parentDirectoryId?: number,
  selected?: boolean,
  isExample?: boolean,
  treasureHunt?: TreasureHunt
}


export interface DirectoryDbRef {
  name?: string;
  id?: number;
  parentDirectoryId?: number;
  settingsId?: number;
  createdDate?: Date;
  modifiedDate?: Date;
}
