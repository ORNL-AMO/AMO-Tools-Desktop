import { Injectable } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { IndexedDbService } from './indexed-db.service';
import * as _ from 'lodash';
import { AssessmentDbService } from './assessment-db.service';
import { CalculatorDbService } from './calculator-db.service';
import { Calculator } from '../shared/models/calculators';
import { InventoryDbService } from './inventory-db.service';
@Injectable()
export class DirectoryDbService {

  allDirectories: Array<Directory>;
  constructor(private indexedDbService: IndexedDbService, private assessmentDbService: AssessmentDbService, private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService) {
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
          resolve(true);
        });
      } else {
        this.allDirectories = [];
        resolve(false);
      }
    });
  }

  getAll() {
    return this.allDirectories;
  }

  getById(id: number): Directory {
    let selectedDirectory: Directory = _.find(this.allDirectories, (directory) => { return directory.id === id; });
    if (selectedDirectory) {
      selectedDirectory.assessments = this.assessmentDbService.getByDirectoryId(id);
      selectedDirectory.subDirectory = this.getSubDirectoriesById(id);
      selectedDirectory.calculators = this.calculatorDbService.getByDirectoryId(id);
      selectedDirectory.inventories = this.inventoryDbService.getByDirectoryId(id);
    }
    return selectedDirectory;
  }

  getSubDirectoriesById(id: number): Array<Directory> {
    let subDirectories: Array<Directory> = _.filter(this.allDirectories, (subDir) => { return subDir.parentDirectoryId === id; });
    subDirectories.forEach(directory => {
      directory = this.getById(directory.id);
    })
    return subDirectories;
  }

  getExample(): Directory {
    let example: Directory = _.find(this.allDirectories, (directory: Directory) => {
      return (directory.isExample === true);
    });
    return example;
  }
}
