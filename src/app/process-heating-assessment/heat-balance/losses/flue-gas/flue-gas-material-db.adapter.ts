import { from, Observable } from 'rxjs';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { MaterialDbService } from '../charge-material/material-selector';

/** `FlueGasMaterialDbService` keeps its observable CRUD private, so expose the shape `MaterialSelector` expects. */
export function adaptFlueGasMaterialDb(dbService: FlueGasMaterialDbService): MaterialDbService<FlueGasMaterial> {
  return {
    getAllWithObservable: (): Observable<FlueGasMaterial[]> => dbService.dbFlueGasMaterials.asObservable(),
    addWithObservable: (material: FlueGasMaterial): Observable<FlueGasMaterial> =>
      from(dbService.addMaterial(material).then(id => ({ ...material, id }))),
  };
}
