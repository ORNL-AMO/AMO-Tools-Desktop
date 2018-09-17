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
      if (this.indexedDbService.db) {
        this.indexedDbService.getAllDirectories().then(directories => {
          this.allDirectories = directories;
          resolve(true)
        })
      } else {
        this.allDirectories = [];
        resolve(false);
      }
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

  getExample(): Directory {
    let example: Directory = _.find(JSON.parse(JSON.stringify(this.allDirectories)), (directory: Directory) => {
      return (directory.isExample == true);
    });
    return example;
  }
}
