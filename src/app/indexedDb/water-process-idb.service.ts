import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { WaterDiagramStoreMeta } from './dbConfig';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { WaterDiagram } from '../../process-flow-types/process-flow-types';

@Injectable({
  providedIn: 'root'
})
export class WaterProcessIdbService {
  storeName: string = WaterDiagramStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) { }

  getAllDiagrams(): Observable<Array<WaterDiagram>> {
    return this.dbService.getAll(this.storeName);
  }

  findById(id: number, waterProcesses: WaterDiagram[]): WaterDiagram {
    return  _.find(waterProcesses, (diagram) => { return diagram.id === id; });
  }

  addWithObservable(data: WaterDiagram): Observable<any> {
    data.modifiedDate = new Date();
    return this.dbService.add(this.storeName, data);
  }

  updateWithObservable(data: WaterDiagram): Observable<WaterDiagram> {
    data.modifiedDate = new Date();
    return this.dbService.update(this.storeName, data);
  }


}
