import { TestBed } from '@angular/core/testing';
import { firstValueFrom, throwError } from 'rxjs';
import { NgxIndexedDBModule, NgxIndexedDBService } from 'ngx-indexed-db';
import {
  AssessmentStoreMeta, CalculatorStoreMeta, DiagramStoreMeta, DirectoryStoreMeta, GasLoadMaterialStoreMeta,
  InventoryStoreMeta, SettingsStoreMeta, dbConfig
} from '../../../indexedDb/dbConfig';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { DiagramIdbService } from '../../../indexedDb/diagram-idb.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { InventoryDbService } from '../../../indexedDb/inventory-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AtmosphereDbService } from '../../../indexedDb/atmosphere-db.service';
import { FlueGasMaterialDbService } from '../../../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../../indexedDb/liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../../../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../../../indexedDb/solid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../../../indexedDb/wall-losses-surface-db.service';
import { LightingFixtureServiceDbService } from '../../../indexedDb/lighting-fixture-db.service';
import { UpdateDataService } from '../../../shared/helper-services/update-data.service';
import { SettingsService } from '../../settings.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { CoreService } from '../../../core/core.service';
import { Directory } from '../../../shared/models/directory';
import { Assessment } from '../../../shared/models/assessment';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { Diagram } from '../../../shared/models/diagram';
import { Calculator } from '../../../shared/models/calculators';
import { Settings, getDefaultSettings } from '../../../shared/models/settings';
import { GasLoadChargeMaterial } from '../../../shared/models/materials';
import { ROOT_DIRECTORY_ID, ResetDataService } from './reset-data.service';
import { environment } from '../../../../environments/environment';

const STORES = {
  directories: DirectoryStoreMeta.store,
  assessments: AssessmentStoreMeta.store,
  inventoryItems: InventoryStoreMeta.store,
  diagrams: DiagramStoreMeta.store,
  calculators: CalculatorStoreMeta.store,
  settings: SettingsStoreMeta.store,
  gasLoadMaterials: GasLoadMaterialStoreMeta.store,
};

/** Every row in the stores a reset touches, as read back from IndexedDB. */
interface StoredRows {
  directories: Array<Directory>,
  assessments: Array<Assessment>,
  inventoryItems: Array<InventoryItem>,
  diagrams: Array<Diagram>,
  calculators: Array<Calculator>,
  settings: Array<Settings>,
  gasLoadMaterials: Array<GasLoadChargeMaterial>
}

/** Ids of the rows seeded by {@link seedTypicalUserDatabase}. */
interface SeededIds {
  examplesFolder: number,
  exampleAssessment: number,
  exampleInventory: number,
  exampleDiagram: number,
  userFolder: number,
  userSubFolder: number,
  userAssessmentInUserFolder: number,
  userAssessmentInRoot: number,
  userInventory: number,
  userDiagram: number,
  userCopyInsideExamples: number,
  userFolderInsideExamples: number,
  preAssessmentInExamples: number,
  globalSettings: number,
}

describe('ResetDataService (real IndexedDB)', () => {
  let service: ResetDataService;
  let dbService: NgxIndexedDBService;
  let coreService: jasmine.SpyObj<CoreService>;
  let featureFlagService: jasmine.SpyObj<FeatureFlagService>;
  let seeded: SeededIds;

  const add = async <T>(store: string, row: T): Promise<T & { id: number }> => firstValueFrom(dbService.add(store, row));

  const readAll = async (): Promise<StoredRows> => ({
    directories: await firstValueFrom(dbService.getAll(STORES.directories)),
    assessments: await firstValueFrom(dbService.getAll(STORES.assessments)),
    inventoryItems: await firstValueFrom(dbService.getAll(STORES.inventoryItems)),
    diagrams: await firstValueFrom(dbService.getAll(STORES.diagrams)),
    calculators: await firstValueFrom(dbService.getAll(STORES.calculators)),
    settings: await firstValueFrom(dbService.getAll(STORES.settings)),
    gasLoadMaterials: await firstValueFrom(dbService.getAll(STORES.gasLoadMaterials)),
  });

  const ids = (rows: Array<{ id?: number }>): Array<number> => rows.map(row => row.id).sort((a, b) => a - b);

  /**
   * Rows that point at something that no longer exists. A reset must never leave any.
   * @param rows Stored rows.
   * @returns Descriptions of orphaned rows; empty when the data is consistent.
   */
  const findOrphans = (rows: StoredRows): Array<string> => {
    const directoryIds: Array<number> = ids(rows.directories);
    const assessmentIds: Array<number> = ids(rows.assessments);
    const inventoryIds: Array<number> = ids(rows.inventoryItems);
    const diagramIds: Array<number> = ids(rows.diagrams);
    const orphans: Array<string> = [];
    rows.directories.filter(directory => directory.parentDirectoryId != null && !directoryIds.includes(directory.parentDirectoryId))
      .forEach(directory => orphans.push(`folder ${directory.id} in missing folder ${directory.parentDirectoryId}`));
    [...rows.assessments, ...rows.inventoryItems, ...rows.diagrams].filter(item => !directoryIds.includes(item.directoryId))
      .forEach(item => orphans.push(`item ${item.id} in missing folder ${item.directoryId}`));
    rows.calculators.filter(calculator => calculator.assessmentId ? !assessmentIds.includes(calculator.assessmentId) : !directoryIds.includes(calculator.directoryId))
      .forEach(calculator => orphans.push(`calculator ${calculator.id}`));
    rows.settings.filter(settings => {
      if (settings.assessmentId) { return !assessmentIds.includes(settings.assessmentId); }
      if (settings.inventoryId) { return !inventoryIds.includes(settings.inventoryId); }
      if (settings.diagramId) { return !diagramIds.includes(settings.diagramId); }
      return !directoryIds.includes(settings.directoryId);
    }).forEach(settings => orphans.push(`settings ${settings.id}`));
    return orphans;
  };

  /**
   * Seeds what a long-time user typically has: the root folder and global settings, the Examples folder with
   * example items, their own folders and items, plus content they saved inside the Examples folder.
   * Assessments use the current appVersion so AssessmentDbService.getAllAssessments skips its version migration.
   * @returns Ids of the seeded rows.
   */
  const seedTypicalUserDatabase = async (): Promise<SeededIds> => {
    await add<Directory>(STORES.directories, { id: ROOT_DIRECTORY_ID, name: 'All Assessments', parentDirectoryId: null });
    const globalSettings = await add<Settings>(STORES.settings, {
      ...getDefaultSettings(), directoryId: ROOT_DIRECTORY_ID, unitsOfMeasure: 'Metric',
      disableTutorial: true, disableWaterTutorial: true, disableCompressedAirTutorial: true, printAll: true,
    });
    await add<Calculator>(STORES.calculators, { directoryId: ROOT_DIRECTORY_ID });

    const examplesFolder = await add<Directory>(STORES.directories, { name: 'Examples', parentDirectoryId: ROOT_DIRECTORY_ID, isExample: true });
    await add<Settings>(STORES.settings, { directoryId: examplesFolder.id });
    const exampleAssessment = await add<Assessment>(STORES.assessments, { appVersion: environment.version, name: 'Example pump', directoryId: examplesFolder.id, isExample: true } as Assessment);
    await add<Settings>(STORES.settings, { assessmentId: exampleAssessment.id, directoryId: examplesFolder.id });
    await add<Calculator>(STORES.calculators, { assessmentId: exampleAssessment.id });
    const exampleInventory = await add<InventoryItem>(STORES.inventoryItems, { name: 'Example motors', directoryId: examplesFolder.id, isExample: true } as InventoryItem);
    await add<Settings>(STORES.settings, { inventoryId: exampleInventory.id });
    const exampleDiagram = await add<Diagram>(STORES.diagrams, { name: 'Example diagram', directoryId: examplesFolder.id, isExample: true, assessmentId: exampleAssessment.id } as Diagram);
    await add<Settings>(STORES.settings, { diagramId: exampleDiagram.id });

    const userFolder = await add<Directory>(STORES.directories, { name: 'My plant', parentDirectoryId: ROOT_DIRECTORY_ID });
    await add<Settings>(STORES.settings, { directoryId: userFolder.id });
    await add<Calculator>(STORES.calculators, { directoryId: userFolder.id });
    const userSubFolder = await add<Directory>(STORES.directories, { name: 'Boiler room', parentDirectoryId: userFolder.id });
    const userAssessmentInUserFolder = await add<Assessment>(STORES.assessments, { appVersion: environment.version, name: 'My pump', directoryId: userFolder.id, isExample: false } as Assessment);
    await add<Settings>(STORES.settings, { assessmentId: userAssessmentInUserFolder.id, directoryId: userFolder.id });
    await add<Calculator>(STORES.calculators, { assessmentId: userAssessmentInUserFolder.id });
    const userAssessmentInRoot = await add<Assessment>(STORES.assessments, { appVersion: environment.version, name: 'My fan', directoryId: ROOT_DIRECTORY_ID, isExample: false } as Assessment);
    await add<Settings>(STORES.settings, { assessmentId: userAssessmentInRoot.id });
    const userInventory = await add<InventoryItem>(STORES.inventoryItems, { name: 'My motors', directoryId: userSubFolder.id, isExample: false } as InventoryItem);
    await add<Settings>(STORES.settings, { inventoryId: userInventory.id });
    const userDiagram = await add<Diagram>(STORES.diagrams, { name: 'My diagram', directoryId: ROOT_DIRECTORY_ID, isExample: false } as Diagram);
    await add<Settings>(STORES.settings, { diagramId: userDiagram.id });

    // Copying an example into the Examples folder saves it there with isExample = false.
    const userCopyInsideExamples = await add<Assessment>(STORES.assessments, { appVersion: environment.version, name: 'Copy of Example pump', directoryId: examplesFolder.id, isExample: false } as Assessment);
    await add<Settings>(STORES.settings, { assessmentId: userCopyInsideExamples.id, directoryId: examplesFolder.id });
    const userFolderInsideExamples = await add<Directory>(STORES.directories, { name: 'My notes', parentDirectoryId: examplesFolder.id });
    const preAssessmentInExamples = await add<Calculator>(STORES.calculators, { directoryId: examplesFolder.id });

    await add<GasLoadChargeMaterial>(STORES.gasLoadMaterials, { substance: 'Default gas', isDefault: true } as GasLoadChargeMaterial);
    await add<GasLoadChargeMaterial>(STORES.gasLoadMaterials, { substance: 'My gas', isDefault: false } as GasLoadChargeMaterial);

    return {
      examplesFolder: examplesFolder.id, exampleAssessment: exampleAssessment.id, exampleInventory: exampleInventory.id,
      exampleDiagram: exampleDiagram.id, userFolder: userFolder.id, userSubFolder: userSubFolder.id,
      userAssessmentInUserFolder: userAssessmentInUserFolder.id, userAssessmentInRoot: userAssessmentInRoot.id,
      userInventory: userInventory.id, userDiagram: userDiagram.id, userCopyInsideExamples: userCopyInsideExamples.id,
      userFolderInsideExamples: userFolderInsideExamples.id, preAssessmentInExamples: preAssessmentInExamples.id,
      globalSettings: globalSettings.id,
    };
  };

  /** Stand-in for importing ExamplesData.json: a new Examples folder with one example assessment, its settings and calculator. */
  const importExampleFixture = async (): Promise<boolean> => {
    const examplesFolder = await add<Directory>(STORES.directories, { name: 'Examples', parentDirectoryId: ROOT_DIRECTORY_ID, isExample: true });
    const assessment = await add<Assessment>(STORES.assessments, { appVersion: environment.version, name: 'Fresh example pump', directoryId: examplesFolder.id, isExample: true } as Assessment);
    await add<Settings>(STORES.settings, { assessmentId: assessment.id, directoryId: examplesFolder.id });
    await add<Calculator>(STORES.calculators, { assessmentId: assessment.id, directoryId: examplesFolder.id });
    return true;
  };

  /**
   * Adds an example calculator as older imports saved it: in the Examples folder, linked to an assessment that doesn't exist.
   * @returns The calculator's id.
   */
  const addStaleExampleCalculator = async (): Promise<number> => {
    const staleAssessmentId: number = Math.max(...ids((await readAll()).assessments)) + 100;
    return (await add<Calculator>(STORES.calculators, { assessmentId: staleAssessmentId, directoryId: seeded.examplesFolder })).id;
  };

  /**
   * Adds a folder copied from Examples before copies cleared isExample: the folder still says isExample,
   * the assessment inside (the user's copy) does not.
   * @returns The copied folder's and assessment's ids.
   */
  const addLegacyExamplesCopy = async (): Promise<{ folder: number, assessment: number }> => {
    const folder = await add<Directory>(STORES.directories, { name: 'Examples (copy)', parentDirectoryId: ROOT_DIRECTORY_ID, isExample: true });
    await add<Settings>(STORES.settings, { directoryId: folder.id });
    const assessment = await add<Assessment>(STORES.assessments, { appVersion: environment.version, name: 'My copied pump', directoryId: folder.id, isExample: false } as Assessment);
    await add<Settings>(STORES.settings, { assessmentId: assessment.id, directoryId: folder.id });
    return { folder: folder.id, assessment: assessment.id };
  };

  beforeEach(async () => {
    coreService = jasmine.createSpyObj<CoreService>('CoreService', ['loadExampleDirectory']);
    coreService.loadExampleDirectory.and.callFake(importExampleFixture);
    featureFlagService = jasmine.createSpyObj<FeatureFlagService>('FeatureFlagService', ['restoreUserFlagsToDefault']);

    TestBed.configureTestingModule({
      imports: [NgxIndexedDBModule.forRoot({ ...dbConfig, name: 'reset-data-service-spec' })],
      providers: [
        ResetDataService, DirectoryDbService, AssessmentDbService, InventoryDbService, DiagramIdbService, CalculatorDbService,
        SettingsDbService, SettingsService, AtmosphereDbService, FlueGasMaterialDbService, GasLoadMaterialDbService,
        LiquidLoadMaterialDbService, SolidLiquidMaterialDbService, SolidLoadMaterialDbService, WallLossesSurfaceDbService,
        LightingFixtureServiceDbService,
        { provide: UpdateDataService, useValue: {} },
        { provide: CoreService, useValue: coreService },
        { provide: FeatureFlagService, useValue: featureFlagService },
      ],
    });
    service = TestBed.inject(ResetDataService);
    dbService = TestBed.inject(NgxIndexedDBService);

    // Clearing (not deleting) the test database: deleteDatabase is blocked while services hold a connection open.
    for (const store of Object.values(STORES)) {
      await firstValueFrom(dbService.clear(store));
    }
    seeded = await seedTypicalUserDatabase();
  });

  it('starts from consistent seed data', async () => {
    expect(findOrphans(await readAll())).toEqual([]);
  });

  describe('Reset Example Items', () => {
    it('replaces the example items with a fresh copy and keeps everything the user made', async () => {
      const before: StoredRows = await readAll();

      await service.restoreExampleItems();

      const after: StoredRows = await readAll();
      const exampleFolders: Array<Directory> = after.directories.filter(directory => directory.isExample);
      expect(exampleFolders.length).withContext('exactly one Examples folder').toBe(1);
      expect(exampleFolders[0].id).not.toBe(seeded.examplesFolder);
      expect(after.assessments.filter(assessment => assessment.isExample).map(assessment => assessment.name)).toEqual(['Fresh example pump']);
      expect(ids(after.inventoryItems)).toEqual([seeded.userInventory]);
      expect(ids(after.diagrams)).toEqual([seeded.userDiagram]);
      expect(ids(after.assessments.filter(assessment => !assessment.isExample)))
        .toEqual(ids(before.assessments.filter(assessment => !assessment.isExample)));
      expect(after.settings.find(settings => settings.id === seeded.globalSettings)).toEqual(before.settings.find(settings => settings.id === seeded.globalSettings));
      expect(after.gasLoadMaterials).toEqual(before.gasLoadMaterials);
      expect(findOrphans(after)).toEqual([]);
    });

    it('moves user content saved inside the Examples folder to All Assessments instead of deleting it', async () => {
      await service.restoreExampleItems();

      const after: StoredRows = await readAll();
      expect(after.assessments.find(assessment => assessment.id === seeded.userCopyInsideExamples).directoryId).toBe(ROOT_DIRECTORY_ID);
      expect(after.directories.find(directory => directory.id === seeded.userFolderInsideExamples).parentDirectoryId).toBe(ROOT_DIRECTORY_ID);
      expect(after.calculators.find(calculator => calculator.id === seeded.preAssessmentInExamples).directoryId).toBe(ROOT_DIRECTORY_ID);
      expect(after.settings.some(settings => settings.assessmentId === seeded.userCopyInsideExamples)).toBeTrue();
      const newExamplesFolderId: number = after.directories.find(directory => directory.isExample).id;
      expect(after.assessments.filter(assessment => assessment.directoryId === newExamplesFolderId).every(assessment => assessment.isExample)).toBeTrue();
    });

    it('deletes old example calculators with stale links and keeps the fresh examples\' calculators', async () => {
      const staleCalculator: number = await addStaleExampleCalculator();

      await service.restoreExampleItems();

      const after: StoredRows = await readAll();
      const freshExample: Assessment = after.assessments.find(assessment => assessment.isExample);
      expect(ids(after.calculators)).not.toContain(staleCalculator);
      expect(after.calculators.some(calculator => calculator.assessmentId === freshExample.id)).toBeTrue();
      expect(findOrphans(after)).toEqual([]);
    });

    it('restores the Examples folder when the user had deleted it, without leaving extra folders or settings', async () => {
      await firstValueFrom(dbService.bulkDelete(STORES.directories, [seeded.examplesFolder, seeded.userFolderInsideExamples]));
      await firstValueFrom(dbService.bulkDelete(STORES.assessments, [seeded.exampleAssessment, seeded.userCopyInsideExamples]));
      await firstValueFrom(dbService.bulkDelete(STORES.inventoryItems, [seeded.exampleInventory]));
      await firstValueFrom(dbService.bulkDelete(STORES.diagrams, [seeded.exampleDiagram]));
      await firstValueFrom(dbService.bulkDelete(STORES.calculators, [seeded.preAssessmentInExamples]));
      await deleteRowsLeftByDeletedItems();
      const before: StoredRows = await readAll();

      await service.restoreExampleItems();

      const after: StoredRows = await readAll();
      expect(coreService.loadExampleDirectory).toHaveBeenCalledTimes(1);
      expect(after.directories.length).toBe(before.directories.length + 1);
      expect(after.settings.length).toBe(before.settings.length + 1);
      expect(findOrphans(after)).toEqual([]);
    });

    it('changes nothing and reports an error when the example data cannot be loaded', async () => {
      coreService.loadExampleDirectory.and.resolveTo(false);
      const before: StoredRows = await readAll();

      await expectAsync(service.restoreExampleItems()).toBeRejectedWithError(/could not be loaded/);

      expect(await readAll()).toEqual(before);
    });

    it('removes a partly loaded Examples folder and keeps the old examples when the load fails midway', async () => {
      coreService.loadExampleDirectory.and.callFake(async () => {
        await importExampleFixture();
        return false;
      });
      const before: StoredRows = await readAll();

      await expectAsync(service.restoreExampleItems()).toBeRejectedWithError(/could not be loaded/);

      expect(await readAll()).toEqual(before);
    });

    it('leaves a copied Examples folder alone when the load fails without writing anything', async () => {
      await addLegacyExamplesCopy();
      coreService.loadExampleDirectory.and.resolveTo(false);
      const before: StoredRows = await readAll();

      await expectAsync(service.restoreExampleItems()).toBeRejectedWithError(/could not be loaded/);

      expect(await readAll()).toEqual(before);
    });

    it('keeps a copied Examples folder and its contents across two resets, with one set of examples each time', async () => {
      const copy: { folder: number, assessment: number } = await addLegacyExamplesCopy();

      for (let reset = 1; reset <= 2; reset++) {
        await service.restoreExampleItems();

        const after: StoredRows = await readAll();
        expect(after.assessments.filter(assessment => assessment.isExample).map(assessment => assessment.name))
          .withContext(`reset ${reset}: one fresh example`).toEqual(['Fresh example pump']);
        expect(ids(after.directories)).withContext(`reset ${reset}: copy kept`).toContain(copy.folder);
        expect(after.assessments.find(assessment => assessment.id === copy.assessment).directoryId).toBe(copy.folder);
        expect(findOrphans(after)).toEqual([]);
      }
    });

    it('removes the new examples again when replacing the old ones fails, so a retry leaves one set', async () => {
      const directoryDbService: DirectoryDbService = TestBed.inject(DirectoryDbService);
      const updateDirectory = directoryDbService.updateWithObservable.bind(directoryDbService);
      let failNextUpdate: boolean = true;
      spyOn(directoryDbService, 'updateWithObservable').and.callFake((directory: Directory) => {
        if (failNextUpdate) {
          failNextUpdate = false;
          return throwError(() => new Error('write failed'));
        }
        return updateDirectory(directory);
      });

      await expectAsync(service.restoreExampleItems()).toBeRejectedWithError(/could not be fully restored/);

      const afterFailure: StoredRows = await readAll();
      expect(afterFailure.directories.filter(directory => directory.isExample).map(directory => directory.id)).toEqual([seeded.examplesFolder]);
      expect(afterFailure.assessments.some(assessment => assessment.name === 'Fresh example pump')).toBeFalse();
      expect(findOrphans(afterFailure)).toEqual([]);

      await service.restoreExampleItems();

      const afterRetry: StoredRows = await readAll();
      expect(afterRetry.directories.filter(directory => directory.isExample).length).toBe(1);
      expect(afterRetry.assessments.filter(assessment => assessment.isExample).map(assessment => assessment.name)).toEqual(['Fresh example pump']);
      expect(afterRetry.directories.find(directory => directory.id === seeded.userFolderInsideExamples).parentDirectoryId).toBe(ROOT_DIRECTORY_ID);
      expect(findOrphans(afterRetry)).toEqual([]);
    });
  });

  describe('Delete User Items', () => {
    it('moves an Examples folder the user put inside their own folder back to All Assessments', async () => {
      const examplesFolder: Directory = (await readAll()).directories.find(directory => directory.id === seeded.examplesFolder);
      await firstValueFrom(dbService.update(STORES.directories, { ...examplesFolder, parentDirectoryId: seeded.userFolder }));

      await service.deleteUserItems();

      const after: StoredRows = await readAll();
      expect(after.directories.find(directory => directory.id === seeded.examplesFolder).parentDirectoryId).toBe(ROOT_DIRECTORY_ID);
      expect(ids(after.assessments)).toEqual([seeded.exampleAssessment]);
      expect(findOrphans(after)).toEqual([]);
    });

    it('deletes user items, folders, pre-assessments and their settings, and keeps examples, global settings and materials', async () => {
      const before: StoredRows = await readAll();

      await service.deleteUserItems();

      const after: StoredRows = await readAll();
      expect(ids(after.directories)).toEqual([ROOT_DIRECTORY_ID, seeded.examplesFolder]);
      expect(ids(after.assessments)).toEqual([seeded.exampleAssessment]);
      expect(ids(after.inventoryItems)).toEqual([seeded.exampleInventory]);
      expect(ids(after.diagrams)).toEqual([seeded.exampleDiagram]);
      expect(after.calculators.map(calculator => calculator.assessmentId)).toEqual([seeded.exampleAssessment]);
      expect(after.settings.find(settings => settings.id === seeded.globalSettings)).toEqual(before.settings.find(settings => settings.id === seeded.globalSettings));
      expect(after.settings.some(settings => settings.directoryId === seeded.examplesFolder && !settings.assessmentId)).withContext('Examples folder settings kept').toBeTrue();
      expect(after.gasLoadMaterials).toEqual(before.gasLoadMaterials);
      expect(findOrphans(after)).toEqual([]);
    });

    it('keeps example calculators whose link is stale', async () => {
      const staleCalculator: number = await addStaleExampleCalculator();

      await service.deleteUserItems();

      expect(ids((await readAll()).calculators)).toContain(staleCalculator);
    });
  });

  describe('Delete Custom Materials', () => {
    it('deletes custom materials and leaves folders, items and settings untouched', async () => {
      const before: StoredRows = await readAll();

      await service.deleteCustomMaterials();

      const after: StoredRows = await readAll();
      expect(after.gasLoadMaterials.map(material => material.substance)).toEqual(['Default gas']);
      expect({ ...after, gasLoadMaterials: [] }).toEqual({ ...before, gasLoadMaterials: [] });
    });
  });

  describe('Reset Application Settings', () => {
    it('resets the global settings row to defaults while keeping tutorial and print preferences', async () => {
      const before: StoredRows = await readAll();

      await service.restoreDefaultAppSettings();

      const after: StoredRows = await readAll();
      const globalSettings: Settings = after.settings.find(settings => settings.id === seeded.globalSettings);
      expect(globalSettings.unitsOfMeasure).toBe(getDefaultSettings().unitsOfMeasure);
      expect(globalSettings.directoryId).toBe(ROOT_DIRECTORY_ID);
      expect(globalSettings.disableTutorial).toBeTrue();
      expect(globalSettings.disableWaterTutorial).toBeTrue();
      expect(globalSettings.disableCompressedAirTutorial).toBeTrue();
      expect(globalSettings.printAll).toBeTrue();
      expect(after.settings.length).withContext('no settings row added').toBe(before.settings.length);
      expect(featureFlagService.restoreUserFlagsToDefault).toHaveBeenCalled();
      const withoutGlobalSettings = (rows: StoredRows) => ({ ...rows, settings: rows.settings.filter(settings => settings.id !== seeded.globalSettings) });
      expect(withoutGlobalSettings(after)).toEqual(withoutGlobalSettings(before));
    });

    it('creates the global settings row from defaults when it is missing, instead of copying in-memory settings', async () => {
      await firstValueFrom(dbService.delete(STORES.settings, seeded.globalSettings));
      TestBed.inject(SettingsDbService).globalSettings = { ...getDefaultSettings(), unitsOfMeasure: 'Metric', disableTutorial: true };

      await service.restoreDefaultAppSettings();

      const globalRows: Array<Settings> = (await readAll()).settings
        .filter(settings => settings.directoryId === ROOT_DIRECTORY_ID && !settings.assessmentId && !settings.inventoryId && !settings.diagramId);
      expect(globalRows.length).toBe(1);
      expect(globalRows[0].unitsOfMeasure).toBe(getDefaultSettings().unitsOfMeasure);
      expect(globalRows[0].disableTutorial).toBe(getDefaultSettings().disableTutorial);
    });
  });

  describe('all four options, in the order the modal runs them', () => {
    it('leaves only All Assessments, a fresh Examples folder, default materials and default global settings', async () => {
      await service.restoreExampleItems();
      await service.deleteUserItems();
      await service.deleteCustomMaterials();
      await service.restoreDefaultAppSettings();

      const after: StoredRows = await readAll();
      expect(after.directories.map(directory => directory.name).sort()).toEqual(['All Assessments', 'Examples']);
      expect(after.assessments.map(assessment => assessment.name)).toEqual(['Fresh example pump']);
      expect(after.inventoryItems).toEqual([]);
      expect(after.diagrams).toEqual([]);
      expect(after.calculators.map(calculator => calculator.assessmentId)).toEqual(ids(after.assessments));
      expect(after.gasLoadMaterials.map(material => material.substance)).toEqual(['Default gas']);
      expect(after.settings.find(settings => settings.id === seeded.globalSettings).unitsOfMeasure).toBe(getDefaultSettings().unitsOfMeasure);
      expect(findOrphans(after)).toEqual([]);
    });
  });

  /** Deletes settings and calculators whose folder or item was deleted, as the app does when a user deletes items. */
  async function deleteRowsLeftByDeletedItems(): Promise<void> {
    const rows: StoredRows = await readAll();
    const orphans: Array<string> = findOrphans(rows);
    await firstValueFrom(dbService.bulkDelete(STORES.settings, ids(rows.settings.filter(settings => orphans.includes(`settings ${settings.id}`)))));
    await firstValueFrom(dbService.bulkDelete(STORES.calculators, ids(rows.calculators.filter(calculator => orphans.includes(`calculator ${calculator.id}`)))));
  }
});
