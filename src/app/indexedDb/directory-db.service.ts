import { Injectable } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { IndexedDbService } from './indexed-db.service';
import * as _ from 'lodash';
@Injectable()
export class DirectoryDbService {

  allDirectories: Array<Directory>;
  constructor(private indexedDbService: IndexedDbService) { }

  setAll(){
    this.indexedDbService.getAllDirectories().then(directories => {
      this.allDirectories = directories;
    })
  }

  getAll(){
    return this.allDirectories;
  }

  getById(id: number): Directory{
    let selecteDirectory: Directory = _.find(this.allDirectories, (directory)=> {return directory.id == id})
    return selecteDirectory;
  }

  getSubDirectoriesById(id: number): Array<Directory>{
    let subDirectories: Array<Directory> = _.filter(this.allDirectories, (subDir)=> {return subDir.parentDirectoryId == id});
    return subDirectories;
  }
}
