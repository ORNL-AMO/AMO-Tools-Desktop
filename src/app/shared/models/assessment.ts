import { PSAT } from './psat';
import { PHAST } from './phast';

export interface Assessment{
  psat?: PSAT,
  phast?: PHAST,
  date?: Date,
  type: string;
  filePath?: string,
  name: string
}
