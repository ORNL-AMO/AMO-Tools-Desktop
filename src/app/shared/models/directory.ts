import { Assessment } from './assessment';
import { Calculator } from './calculators';
export interface Directory {
  name: string,
  assessments?: Assessment[];
  subDirectory?: Directory[],
  calculators?:  Calculator[],
  collapsed?: boolean,
  createdDate?: Date,
  modifiedDate?: Date,
  id?: number,
  parentDirectoryId?: number,
  selected?: boolean,

}


export interface DirectoryDbRef {
  name?: string,
  id?: number,
  parentDirectoryId?: number,
  settingsId?: number,
  createdDate?: Date;
  modifiedDate?: Date;
}