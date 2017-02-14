import { PSAT } from './psat';

export interface Directory {
  name: string,
  psat?: PSAT[],
  directories?: Directory[]
}
