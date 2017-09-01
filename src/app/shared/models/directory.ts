import { Assessment } from './assessment';
export interface Directory {
  name: string,
  assessments?: Assessment[];
  subDirectory?: Directory[],
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