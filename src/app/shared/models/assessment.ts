import { PSAT } from './psat';
import { PHAST } from './phast';

export interface Assessment {
  id?: number,
  directoryId?: number,
  psat?: PSAT,
  phast?: PHAST,
  createdDate?: Date,
  modifiedDate?: Date,
  type: string;
  name: string,
  selected?: boolean,
}