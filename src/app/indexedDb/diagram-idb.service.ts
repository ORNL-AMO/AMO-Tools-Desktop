import { Injectable } from '@angular/core';
import { DiagramStoreMeta } from './dbConfig';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, firstValueFrom } from 'rxjs';
import * as _ from 'lodash';
import { getNewIdString } from '../shared/helperFunctions';
import { environment } from '../../environments/environment';
import { Diagram } from '../shared/models/diagram';

@Injectable({
  providedIn: 'root'
})
export class DiagramIdbService {

  storeName: string = DiagramStoreMeta.store;
  allDiagrams: Diagram[];
  constructor(private dbService: NgxIndexedDBService) { }

  async setAll(diagrams?: Array<Diagram>) {
    if (diagrams) {
      this.allDiagrams = diagrams;
    } else {
      this.allDiagrams = await firstValueFrom(this.getAllDiagrams());
    }
  }

  getAllDiagrams(): Observable<Array<Diagram>> {
    return this.dbService.getAll(this.storeName);
  }

  getByDirectoryId(id: number): Array<Diagram> {
    let selectedDiagram: Array<Diagram> = _.filter(this.allDiagrams, (diagram) => { return diagram.directoryId == id; });
    return selectedDiagram;
  }

  findById(id: number): Diagram {
    return _.find(this.allDiagrams, (diagram) => { return diagram.id === id; });
  }

  addWithObservable(data: Diagram): Observable<any> {
    data.modifiedDate = new Date();
    return this.dbService.add(this.storeName, data);
  }

  updateWithObservable(data: Diagram): Observable<Diagram> {
    data.modifiedDate = new Date();
    return this.dbService.update(this.storeName, data);
  }


  
  getNewDiagram(diagramType: string): Diagram {
    let currentDate = new Date();
    let defaultName = getNewIdString();
    return {
      createdDate: new Date(),
      modifiedDate: new Date(),
      name: null,
      appVersion: environment.version,
      type: diagramType,
    }
  }

  deleteByIdWithObservable(diagramid: number): Observable<any> {
    return this.dbService.delete(this.storeName, diagramid);
  }

  bulkDeleteWithObservable(diagramids: Array<number>): Observable<any> {
    // ngx-indexed-db returns Array<Array<T>>
    return this.dbService.bulkDelete(this.storeName, diagramids);
  }

}
