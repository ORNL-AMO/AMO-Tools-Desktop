# Data Persistence

## Storage Model

AMO-Tools-Desktop stores application data in browser/Electron IndexedDB through services under `src/app/indexedDb/`. These services wrap `NgxIndexedDBService` and expose app-specific operations for settings, assessments, calculators, directories, inventories, log-tool data, and suite-backed material data.

Most feature code works with service-level observables or cached service state rather than calling IndexedDB directly.

## Important Data Areas

- Settings: `src/app/indexedDb/settings-db.service.ts` and `src/app/shared/models/settings.ts`
- Assessments: `src/app/indexedDb/assessment-db.service.ts`
- Calculators: `src/app/indexedDb/calculator-db.service.ts`
- Inventories: `src/app/indexedDb/inventory-db.service.ts`
- Directories: `src/app/indexedDb/directory-db.service.ts`
- Suite material data: `src/app/indexedDb/*material*-db.service.ts` and UI under `src/app/suiteDb/`
- Database configuration: `src/app/indexedDb/dbConfig.ts`

## Default Data Initialization

The app initializes suite-backed default data after both IndexedDB and MEASUR-Tools-Suite are ready. `src/app/core/core.component.ts` coordinates initialization and calls `ToolsSuiteApiService.initializeDefaultDbData()`.

`Settings.suiteDbItemsInitialized` prevents repeated insertion of suite-backed default records. This flag is part of the current initialization contract, so changes to it should be treated as persistence behavior changes.

## Backups and Desktop Runtime

Electron backup behavior lives under `src/app/electron/`, especially `automatic-backup.service.ts`. Backup code reads from multiple IndexedDB services and writes desktop backup artifacts. Changes to persisted data shape may need backup/export/import review.

## Change Guidance

When changing saved data shape:

1. Identify the TypeScript model under `src/app/shared/models/`.
2. Check the corresponding IndexedDB service and database object store definition.
3. Trace create, edit, duplicate, delete, import, export, backup, and reset paths.
4. Preserve existing user data or provide an explicit migration/reset strategy.
5. Verify affected feature flows, not only TypeScript compile.

When changing suite-backed default data, review both initialization and reset behavior. Existing users may already have custom material data mixed with suite-provided defaults.
