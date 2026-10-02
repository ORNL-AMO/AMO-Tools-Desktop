import { from, Observable } from 'rxjs';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { MaterialDbService } from '../charge-material/material-selector';

/** `FlueGasMaterialDbService` keeps its observable CRUD private, so expose the shape `MaterialSelector` expects. */
export function adaptFlueGasMaterialDb(dbService: FlueGasMaterialDbService): MaterialDbService<FlueGasMaterial> {
  return {
    getAllWithObservable: (): Observable<FlueGasMaterial[]> => dbService.dbFlueGasMaterials.asObservable(),
    addWithObservable: (material: FlueGasMaterial): Observable<FlueGasMaterial> =>
      from(dbService.addMaterial(material).then(id => ({ ...material, id }))),
  };
}

export function adaptSolidLiquidFlueGasMaterialDb(dbService: SolidLiquidMaterialDbService): MaterialDbService<SolidLiquidFlueGasMaterial> {
  return {
    getAllWithObservable: (): Observable<SolidLiquidFlueGasMaterial[]> => dbService.dbSolidLiquidFlueGasMaterials.asObservable(),
    addWithObservable: (material: SolidLiquidFlueGasMaterial): Observable<SolidLiquidFlueGasMaterial> =>
      from(dbService.addMaterial(material).then(id => ({ ...material, id }))),
  };
}
