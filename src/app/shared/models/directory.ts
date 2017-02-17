import { Assessment } from './assessment';

export interface Directory {
  name: string,
  assessments: Assessment[];
  subDirectory?: Directory[]
  collapsed?: boolean;
  date?: Date;
}
