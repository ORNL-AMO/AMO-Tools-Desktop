import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable } from 'rxjs';
import { FlueGasMaterial } from '../shared/models/materials';
import { FlueGasMaterialStoreMeta } from './dbConfig';

@Injectable()
export class FlueGasMaterialDbService {
  storeName: string = FlueGasMaterialStoreMeta.store;
  dbFlueGasMaterials: BehaviorSubject<Array<FlueGasMaterial>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbFlueGasMaterials = new BehaviorSubject<Array<FlueGasMaterial>>([]);

  }

 
  getAllWithObservable(): Observable<Array<FlueGasMaterial>> {
    return this.dbService.getAll(this.storeName);
  }

  getByIdWithObservable(materialId: number): Observable<FlueGasMaterial> {
    return this.dbService.getByKey(this.storeName, materialId);
  }

  addWithObservable(material: FlueGasMaterial): Observable<FlueGasMaterial> {
    return this.dbService.add(this.storeName, material);
  }

  deleteByIdWithObservable(materialId: number): Observable<Array<FlueGasMaterial>> {
    return this.dbService.delete(this.storeName, materialId);
  }

  updateWithObservable(material: FlueGasMaterial): Observable<FlueGasMaterial> {
    return this.dbService.update(this.storeName, material);
  }

  clearFlueGasMaterials(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }

}