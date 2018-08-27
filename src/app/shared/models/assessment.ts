import { PSAT } from './psat';
import { PHAST } from './phast/phast';
import { FSAT } from './fans';

export interface Assessment {
  id?: number,
  directoryId?: number,
  psat?: PSAT,
  phast?: PHAST,
  fsat?: FSAT,
  createdDate?: Date,
  modifiedDate?: Date,
  type: string;
  name: string,
  selected?: boolean,
  appVersion?: string,
  isExample?: boolean
}