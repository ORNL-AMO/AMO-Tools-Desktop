import { Injectable } from '@angular/core';
import { DiagramStoreMeta } from './dbConfig';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
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
  dbDiagrams: BehaviorSubject<Array<Diagram>> = new BehaviorSubject<Array<Diagram>>([]);
  constructor(private dbService: NgxIndexedDBService) { }

  async setAll(diagrams?: Array<Diagram>) {
    if (diagrams) {
      this.allDiagrams = diagrams;
    } else {
      this.allDiagrams = await firstValueFrom(this.getAllDiagrams());
    }
    this.dbDiagrams.next(this.allDiagrams);
  }

  /**
   * Replaces one diagram in the cache with a copy of the saved object, without re-reading the whole store.
   * Copied so cache consumers that mutate cached diagrams never touch the diagram a component is editing.
   */
  upsertInCache(diagram: Diagram) {
    const cachedDiagram: Diagram = _.cloneDeep(diagram);
    const diagrams: Diagram[] = this.allDiagrams ?? [];
    const cachedIndex: number = diagrams.findIndex((cached: Diagram) => cached.id === diagram.id);
    const updatedDiagrams: Diagram[] = [...diagrams];
    if (cachedIndex === -1) {
      updatedDiagrams.push(cachedDiagram);
    } else {
      updatedDiagrams[cachedIndex] = cachedDiagram;
    }
    this.allDiagrams = updatedDiagrams;
    this.dbDiagrams.next(this.allDiagrams);
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

  getByIdAsync(id: number): Observable<Diagram> {
    return this.dbService.getByID(this.storeName, id);
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
