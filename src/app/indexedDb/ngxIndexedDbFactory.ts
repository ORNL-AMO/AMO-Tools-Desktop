import { isPlatformBrowser } from "@angular/common";
import { inject, PLATFORM_ID } from "@angular/core";
import { DBConfig, NgxIndexedDBService } from "ngx-indexed-db";
import { throwError } from "rxjs";
import { dbConfig } from "./dbConfig";

export const DB_CONFIGS: Record<string, DBConfig> = {
  default: dbConfig,
  CrudDB: dbConfig,
};

// * NOTE: below factory could be used as workaround to provide the service under firefox strict mode but does not currently work in normal browsing
// * EXPLANATION: Firefox, under strict privacy/data protection chooses to block IndexedDB open silently 
// * and will allow angular to continue providing NgxIndexedDBService (with errors) across the app and user data warnings will NOT SHOW
export function customNgxIndexedDBFactory(): NgxIndexedDBService {
  // todo verify DB_CONFIG pattern fits current ngxIndexedDB api
  const dbConfigs = DB_CONFIGS;
  const platformId = inject(PLATFORM_ID);
  
  if (isPlatformBrowser(platformId)) {
    try {
      // Attempt a test open to ensure IndexedDB is available (avoids Safari/FF privacy crashes)
      indexedDB.open(dbConfigs.default.name, dbConfigs.default.version);
      return new NgxIndexedDBService(DB_CONFIGS, platformId);
    } catch (err) {
      console.warn('IndexedDB initialization failed. Falling back.', err);
    }
  }

  // these don't really matter, browserAvailableStorage options will handle messaging
  const stub: Partial<NgxIndexedDBService> = {
    getByKey: () => throwError(() => new Error('IndexedDB unavailable')),
    getAll: () => throwError(() => new Error('IndexedDB unavailable')),
    add: () => throwError(() => new Error('IndexedDB unavailable')),
    delete: () => throwError(() => new Error('IndexedDB unavailable')),
  };

  return stub as NgxIndexedDBService;
}