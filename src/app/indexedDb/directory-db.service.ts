import { Injectable } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { IndexedDbService } from './indexed-db.service';
import * as _ from 'lodash';
@Injectable()
export class DirectoryDbService {

  allDirectories: Array<Directory>;
  constructor(private indexedDbService: IndexedDbService) { 
    // this.indexedDbService.setAllDirs.subscribe(val => {
    //   console.log('set all dirs 1')
    //   this.setAll();
    // })
  }

  setAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.indexedDbService.getAllDirectories().then(directories => {
        this.allDirectories = directories;
        console.log('set all dirs 2')
        resolve(true)
      })
    })
  }

  getAll() {
    return this.allDirectories;
  }

  getById(id: number): Directory {
    let selecteDirectory: Directory = _.find(this.allDirectories, (directory) => { return directory.id == id })
    return selecteDirectory;
  }

  getSubDirectoriesById(id: number): Array<Directory> {
    let subDirectories: Array<Directory> = _.filter(this.allDirectories, (subDir) => { return subDir.parentDirectoryId == id });
    return subDirectories;
  }
}
