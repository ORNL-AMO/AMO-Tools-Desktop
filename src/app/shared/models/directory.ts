import { Assessment } from './assessment';

export interface Directory {
  name: string,
  assessments?: Assessment[];
  subDirectory?: Directory[],
  collapsed?: boolean,
  createdDate?: Date,
  modifiedDate?: Date,
  id?: number
}


export interface DirectoryDbRef {
  name?: string,
  id?: number,
  parentDirectoryId?: number,
  subDirectoryIds?: number[],
  assessmentIds?: number[],
  createdDate?: Date;
  modifiedDate?: Date;
}