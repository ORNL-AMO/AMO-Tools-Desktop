import { PSAT } from './psat';

export interface Assessment{
  psat?: PSAT,
  date?: Date,
  filePath?: string,
  name: string
}
