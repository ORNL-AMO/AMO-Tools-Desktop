import { TestBed } from '@angular/core/testing';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AtmosphereDbService } from './atmosphere-db.service';
import { GasLoadMaterialDbService } from './gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from './liquid-load-material-db.service';
import { SolidLoadMaterialDbService } from './solid-load-material-db.service';
import { WallLossesSurfaceDbService } from './wall-losses-surface-db.service';

interface StoredMaterial {
  id?: number;
  substance?: string;
}

/** In-memory stand-in for the two IndexedDB calls the cache methods make. */
class FakeIndexedDb {
  private rows: StoredMaterial[] = [{ id: 1, substance: 'Default' }];

  getAll(): Observable<StoredMaterial[]> {
    return of([...this.rows]);
  }

  add(_store: string, material: StoredMaterial): Observable<StoredMaterial> {
    const saved = { ...material, id: this.rows.length + 1 };
    this.rows.push(saved);
    return of(saved);
  }
}

interface CachedMaterialService {
  setAllMaterialsFromDb(): Promise<void>;
  addMaterial(material: StoredMaterial): Promise<number>;
}

interface CacheCase {
  service: CachedMaterialService;
  cache: BehaviorSubject<StoredMaterial[]>;
}

const CASES: { name: string; build: (db: NgxIndexedDBService) => CacheCase }[] = [
  {
    name: 'SolidLoadMaterialDbService',
    build: db => {
      const service = new SolidLoadMaterialDbService(db);
      return { service, cache: service.dbSolidLoadChargeMaterials };
    },
  },
  {
    name: 'LiquidLoadMaterialDbService',
    build: db => {
      const service = new LiquidLoadMaterialDbService(db);
      return { service, cache: service.dbLiquidLoadChargeMaterials };
    },
  },
  {
    name: 'GasLoadMaterialDbService',
    build: db => {
      const service = new GasLoadMaterialDbService(db);
      return { service, cache: service.dbGasLoadChargeMaterials };
    },
  },
  {
    name: 'AtmosphereDbService',
    build: db => {
      const service = new AtmosphereDbService(db);
      return { service, cache: service.dbAtmospherSpecificHeatMaterials };
    },
  },
  {
    name: 'WallLossesSurfaceDbService',
    build: db => {
      const service = new WallLossesSurfaceDbService(db);
      return { service, cache: service.dbWallLossesSurfaceMaterials };
    },
  },
];

CASES.forEach(({ name, build }) => {
  describe(`${name} material list cache`, () => {
    let service: CachedMaterialService;
    let cache: BehaviorSubject<StoredMaterial[]>;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [{ provide: NgxIndexedDBService, useClass: FakeIndexedDb }] });
      ({ service, cache } = build(TestBed.inject(NgxIndexedDBService)));
    });

    it('starts empty until refreshed', () => {
      expect(cache.getValue()).toEqual([]);
    });

    it('fills the cached list from the database', async () => {
      await service.setAllMaterialsFromDb();
      expect(cache.getValue()).toEqual([{ id: 1, substance: 'Default' }]);
    });

    it('saves a material, refreshes the cached list, and returns the new id', async () => {
      const id = await service.addMaterial({ substance: 'Custom' });

      expect(id).toBe(2);
      expect(cache.getValue()).toEqual([{ id: 1, substance: 'Default' }, { id: 2, substance: 'Custom' }]);
    });
  });
});
