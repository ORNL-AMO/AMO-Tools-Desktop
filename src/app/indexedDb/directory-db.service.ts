import { Injectable } from '@angular/core';
import { Directory } from '../shared/models/directory';
import * as _ from 'lodash';
import { AssessmentDbService } from './assessment-db.service';
import { CalculatorDbService } from './calculator-db.service';
import { InventoryDbService } from './inventory-db.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { DirectoryStoreMeta } from './dbConfig';
import { Assessment } from '../shared/models/assessment';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { FormGroup } from '@angular/forms';
@Injectable()
export class DirectoryDbService {

  allDirectories: Array<Directory>;
  storeName: string = DirectoryStoreMeta.store;
  dbDirectories: BehaviorSubject<Array<Directory>>;

  constructor(
    private dbService: NgxIndexedDBService,
    private assessmentDbService: AssessmentDbService, private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService) {
      this.dbDirectories = new BehaviorSubject<Array<Directory>>([]);

  }

  count(): Observable<number> {
    return this.dbService.count(this.storeName);
  }

  async setAll(directories?: Array<Directory>) {
    if (directories) {
      this.allDirectories = directories;
    } else {
      this.allDirectories = await firstValueFrom(this.getAllDirectories());
    }
    this.dbDirectories.next(this.allDirectories);
  }

  setIsMovedExample(item: Assessment | InventoryItem, form: FormGroup) {
    let exampleDirectory: Directory = this.getExample();
    if (exampleDirectory 
      && exampleDirectory.id === item.directoryId
      && item.directoryId !== form.controls.directoryId.value) {
        item.isExample = false;
      }
  }

  getAllDirectories(): Observable<Array<Directory>> {
    return this.dbService.getAll(this.storeName);
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

  addWithObservable(directory: Directory): Observable<any> {
    directory.createdDate = new Date();
    directory.modifiedDate = new Date();
    return this.dbService.add(this.storeName, directory);
  }

  updateWithObservable(directory: Directory): Observable<Directory> {
    directory.modifiedDate = new Date();
    return this.dbService.update(this.storeName, directory);
  }

  deleteByIdWithObservable(id: number): Observable<any> {
    return this.dbService.delete(this.storeName, id);
  }

  bulkDeleteWithObservable(dirIds: Array<number>): Observable<any> {
    // ngx-indexed-db returns Array<Array<T>>
    return this.dbService.bulkDelete(this.storeName, dirIds);
  }

}
