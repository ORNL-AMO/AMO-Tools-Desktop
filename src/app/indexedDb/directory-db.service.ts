import { Injectable } from '@angular/core';
import { Directory } from '../shared/models/directory';
import * as _ from 'lodash';
import { AssessmentDbService } from './assessment-db.service';
import { CalculatorDbService } from './calculator-db.service';
import { InventoryDbService } from './inventory-db.service';
import { firstValueFrom, Observable } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { DirectoryStoreMeta } from './dbConfig';
@Injectable()
export class DirectoryDbService {

  allDirectories: Array<Directory>;
  storeName: string = DirectoryStoreMeta.store;
  constructor(
    private dbService: NgxIndexedDBService,
    private assessmentDbService: AssessmentDbService, private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService) {
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
  }

  async setAllWithObservable(): Promise<any> {
    let allDirectories$ = this.getAllDirectories();
    this.allDirectories = await firstValueFrom(allDirectories$);
    return allDirectories$;
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


  // getById(directoryId: number): Observable<Directory> {
  //   return this.dbService.getByKey(this.storeName, directoryId);
  // }

  add(directory: Directory) {
    directory.createdDate = new Date();
    directory.modifiedDate = new Date();
    this.dbService.add(this.storeName, directory);
  }

  addWithObservable(directory: Directory): Observable<any> {
    directory.createdDate = new Date();
    directory.modifiedDate = new Date();
    return this.dbService.add(this.storeName, directory);
  }

  deleteById(surfaceId: number): void {
    this.dbService.delete(this.storeName, surfaceId);
  }

  update(directory: Directory): void {
    this.dbService.update(this.storeName, directory);
  }

  clearWallLossesSurface(): void {
    this.dbService.clear(this.storeName);
  }

}
