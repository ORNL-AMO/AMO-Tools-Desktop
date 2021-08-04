import { PSAT } from './psat';
import { PHAST } from './phast/phast';
import { FSAT } from './fans';
import { SSMT } from './steam/ssmt';
import { TreasureHunt } from './treasure-hunt';
import { WasteWater } from './waste-water';

export interface Assessment {
  id?: number,
  directoryId?: number,
  psat?: PSAT,
  phast?: PHAST,
  fsat?: FSAT,
  ssmt?: SSMT,
  treasureHunt?: TreasureHunt,
  wasteWater?: WasteWater,
  createdDate?: Date,
  modifiedDate?: Date,
  type: string;
  name: string;
  selected?: boolean;
  appVersion?: string;
  isExample?: boolean;
}
