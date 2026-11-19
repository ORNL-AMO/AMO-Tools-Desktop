import { BehaviorSubject, from, Observable } from 'rxjs';
import { AtmosphereDbService } from '../../../../indexedDb/atmosphere-db.service';
import { FlueGasMaterialDbService } from '../../../../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../../../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../../../indexedDb/liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../../../../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../../../../indexedDb/solid-load-material-db.service';
import {
  AtmosphereSpecificHeat, FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial,
} from '../../../../shared/models/materials';

/** Material list access for the Process Heating forms and add-material dialogs, backed by each database service's cached list. */
export interface MaterialDbService<TMaterial> {
  /** The cached list; emits again whenever it is refreshed, including after `addMaterial`. */
  materials(): Observable<TMaterial[]>;
  /** Saves a material, refreshes the cached list, and emits the saved material with its new id. */
  addMaterial(material: TMaterial): Observable<TMaterial>;
}

function adaptCachedMaterialDb<TMaterial>(
  cache: BehaviorSubject<TMaterial[]>,
  addMaterial: (material: TMaterial) => Promise<number>,
): MaterialDbService<TMaterial> {
  return {
    materials: () => cache.asObservable(),
    addMaterial: material => from(addMaterial(material).then(id => ({ ...material, id }))),
  };
}

export function adaptSolidLoadMaterialDb(dbService: SolidLoadMaterialDbService): MaterialDbService<SolidLoadChargeMaterial> {
  return adaptCachedMaterialDb(dbService.dbSolidLoadChargeMaterials, material => dbService.addMaterial(material));
}

export function adaptLiquidLoadMaterialDb(dbService: LiquidLoadMaterialDbService): MaterialDbService<LiquidLoadChargeMaterial> {
  return adaptCachedMaterialDb(dbService.dbLiquidLoadChargeMaterials, material => dbService.addMaterial(material));
}

export function adaptGasLoadMaterialDb(dbService: GasLoadMaterialDbService): MaterialDbService<GasLoadChargeMaterial> {
  return adaptCachedMaterialDb(dbService.dbGasLoadChargeMaterials, material => dbService.addMaterial(material));
}

export function adaptAtmosphereMaterialDb(dbService: AtmosphereDbService): MaterialDbService<AtmosphereSpecificHeat> {
  return adaptCachedMaterialDb(dbService.dbAtmospherSpecificHeatMaterials, material => dbService.addMaterial(material));
}

export function adaptFlueGasMaterialDb(dbService: FlueGasMaterialDbService): MaterialDbService<FlueGasMaterial> {
  return adaptCachedMaterialDb(dbService.dbFlueGasMaterials, material => dbService.addMaterial(material));
}

export function adaptSolidLiquidFlueGasMaterialDb(dbService: SolidLiquidMaterialDbService): MaterialDbService<SolidLiquidFlueGasMaterial> {
  return adaptCachedMaterialDb(dbService.dbSolidLiquidFlueGasMaterials, material => dbService.addMaterial(material));
}
