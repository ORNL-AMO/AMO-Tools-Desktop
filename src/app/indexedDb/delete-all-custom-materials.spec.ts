import { TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { NgxIndexedDBModule, NgxIndexedDBService } from 'ngx-indexed-db';
import { dbConfig } from './dbConfig';
import { AtmosphereDbService } from './atmosphere-db.service';
import { FlueGasMaterialDbService } from './flue-gas-material-db.service';
import { GasLoadMaterialDbService } from './gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from './liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from './solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from './solid-load-material-db.service';
import { WallLossesSurfaceDbService } from './wall-losses-surface-db.service';
import { LightingFixtureServiceDbService } from './lighting-fixture-db.service';

interface StoredMaterial {
  id?: number;
  isDefault?: boolean;
}

interface MaterialStoreCase {
  name: string;
  service: Type<unknown>;
  getCache: (service: unknown) => BehaviorSubject<Array<StoredMaterial>>;
}

/**
 * Builds a typed test case for one custom-material store.
 * @param name Store name shown in the spec output.
 * @param service The material DB service class under test.
 * @param getCache Returns the cached material list the app reads from.
 * @returns The test case.
 */
function materialStoreCase<T>(name: string, service: Type<T>, getCache: (service: T) => BehaviorSubject<Array<StoredMaterial>>): MaterialStoreCase {
  return { name, service, getCache: (instance: unknown) => getCache(instance as T) };
}

const materialStoreCases: Array<MaterialStoreCase> = [
  materialStoreCase('atmosphere', AtmosphereDbService, service => service.dbAtmospherSpecificHeatMaterials),
  materialStoreCase('flue gas', FlueGasMaterialDbService, service => service.dbFlueGasMaterials),
  materialStoreCase('gas load charge', GasLoadMaterialDbService, service => service.dbGasLoadChargeMaterials),
  materialStoreCase('liquid load charge', LiquidLoadMaterialDbService, service => service.dbLiquidLoadChargeMaterials),
  materialStoreCase('solid liquid flue gas', SolidLiquidMaterialDbService, service => service.dbSolidLiquidFlueGasMaterials),
  materialStoreCase('solid load charge', SolidLoadMaterialDbService, service => service.dbSolidLoadChargeMaterials),
  materialStoreCase('wall losses surface', WallLossesSurfaceDbService, service => service.dbWallLossesSurfaceMaterials),
  materialStoreCase('lighting fixture', LightingFixtureServiceDbService, service => service.dbLightingFixtureMaterials),
];

describe('deleteAllCustomMaterials (real IndexedDB)', () => {
  let dbService: NgxIndexedDBService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxIndexedDBModule.forRoot({ ...dbConfig, name: 'delete-all-custom-materials-spec' })],
      providers: materialStoreCases.map(materialStoreCase => materialStoreCase.service),
    });
    dbService = TestBed.inject(NgxIndexedDBService);
  });

  materialStoreCases.forEach(materialStoreCase => {
    describe(materialStoreCase.name, () => {
      let service: { storeName: string, deleteAllCustomMaterials: () => Promise<unknown> };
      let cache: BehaviorSubject<Array<StoredMaterial>>;

      beforeEach(async () => {
        service = TestBed.inject(materialStoreCase.service) as typeof service;
        cache = materialStoreCase.getCache(service);
        // Clearing (not deleting) the test database: deleteDatabase is blocked while the service holds a connection open.
        await firstValueFrom(dbService.clear(service.storeName));
        const defaultMaterial: StoredMaterial = await firstValueFrom(dbService.add(service.storeName, { isDefault: true }));
        const customMaterial: StoredMaterial = await firstValueFrom(dbService.add(service.storeName, { isDefault: false }));
        cache.next([defaultMaterial, customMaterial]);
      });

      it('deletes custom materials and keeps default materials', async () => {
        await service.deleteAllCustomMaterials();

        const storedMaterials: Array<StoredMaterial> = await firstValueFrom(dbService.getAll(service.storeName));
        expect(storedMaterials.map(material => material.isDefault)).toEqual([true]);
      });

      it('refreshes the cached material list so the app no longer shows deleted materials', async () => {
        await service.deleteAllCustomMaterials();

        const storedMaterials: Array<StoredMaterial> = await firstValueFrom(dbService.getAll(service.storeName));
        expect(cache.getValue()).toEqual(storedMaterials);
      });
    });
  });
});
