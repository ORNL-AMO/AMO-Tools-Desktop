import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as _ from 'lodash';
import { Settings, getDefaultSettings } from '../../../shared/models/settings';
import { Directory } from '../../../shared/models/directory';
import { Assessment } from '../../../shared/models/assessment';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { Diagram } from '../../../shared/models/diagram';
import { Calculator } from '../../../shared/models/calculators';
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
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { CoreService } from '../../../core/core.service';

/** The "All Assessments" folder. The app creates it first, so it always has id 1. */
export const ROOT_DIRECTORY_ID = 1;

/** Global settings the user chose that survive "Reset Application Settings". */
export const PRESERVED_GLOBAL_SETTINGS: Array<keyof Settings> = [
  'disableTutorial',
  'disableDashboardTutorial',
  'disablePsatTutorial',
  'disableFansTutorial',
  'disablePhastTutorial',
  'disableWasteWaterTutorial',
  'disableSteamTutorial',
  'disableMotorInventoryTutorial',
  'disableTreasureHuntTutorial',
  'disableDataExplorerTutorial',
  'disableCompressedAirTutorial',
  'disableProcessCoolingTutorial',
  'disableWaterTutorial',
  'printAll',
];

export interface DirectoryDataIds {
  assessments: Array<number>,
  settings: Array<number>,
  calculators: Array<number>,
  inventories: Array<number>,
  diagrams: Array<number>,
  directories: Array<number>
}

/** A snapshot of every stored row a reset can touch, read straight from IndexedDB. */
interface StoredData {
  directories: Array<Directory>,
  assessments: Array<Assessment>,
  inventoryItems: Array<InventoryItem>,
  diagrams: Array<Diagram>,
  calculators: Array<Calculator>,
  settings: Array<Settings>
}

/**
 * Database work behind the "Reset System Settings" modal. One public method per option the user can select.
 * Every method reads current rows from IndexedDB (not the in-memory caches). Callers run {@link refreshCaches}
 * once after the last step so screens show the result.
 */
@Injectable()
export class ResetDataService {

  constructor(
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService,
    private inventoryDbService: InventoryDbService,
    private diagramIdbService: DiagramIdbService,
    private calculatorDbService: CalculatorDbService,
    private settingsDbService: SettingsDbService,
    private atmosphereDbService: AtmosphereDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private gasLoadDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private lightingFixtureDbService: LightingFixtureServiceDbService,
    private featureFlagService: FeatureFlagService,
    private coreService: CoreService
  ) { }

  /**
   * Replaces the Examples folder with a fresh copy of the example data.
   * The new examples are loaded before anything is deleted. If the load fails, whatever part of it was saved is removed,
   * so existing data is left as it was.
   * User content saved inside the old Examples folder is moved to "All Assessments" rather than deleted.
   * @throws Error when the example data could not be loaded.
   */
  async restoreExampleItems(): Promise<void> {
    const storedBefore: StoredData = await this.getStoredData();
    const oldExampleDirectory: Directory | undefined = storedBefore.directories.find(directory => directory.isExample);

    const loaded: boolean = await this.coreService.loadExampleDirectory();
    const directoriesAfterLoad: Array<Directory> = await firstValueFrom(this.directoryDbService.getAllDirectories());
    const newExampleDirectory: Directory | undefined = directoriesAfterLoad.find(directory => directory.isExample && directory.id !== oldExampleDirectory?.id);
    if (!loaded || !newExampleDirectory) {
      await this.discardPartialExampleLoad(newExampleDirectory);
      throw new Error('Example items could not be loaded. Existing examples were not changed.');
    }

    if (oldExampleDirectory) {
      await this.moveUserContentToRoot(storedBefore, oldExampleDirectory.id);
      await this.deleteRows(this.getExampleDataIds(storedBefore, oldExampleDirectory.id));
    }
  }

  /**
   * Deletes everything the user created: assessments, inventories, diagrams, their settings and calculators,
   * all pre-assessment calculators, and every folder except "All Assessments" and Examples (with the folders' own settings).
   * Example items and global settings are kept.
   */
  async deleteUserItems(): Promise<void> {
    const stored: StoredData = await this.getStoredData();
    await this.deleteRows(this.getUserDataIds(stored));
  }

  /** Deletes custom materials from every material library. Default materials are kept. */
  async deleteCustomMaterials(): Promise<void> {
    await this.atmosphereDbService.deleteAllCustomMaterials();
    await this.flueGasMaterialDbService.deleteAllCustomMaterials();
    await this.gasLoadDbService.deleteAllCustomMaterials();
    await this.liquidLoadMaterialDbService.deleteAllCustomMaterials();
    await this.solidLiquidMaterialDbService.deleteAllCustomMaterials();
    await this.solidLoadMaterialDbService.deleteAllCustomMaterials();
    await this.wallLossesSurfaceDbService.deleteAllCustomMaterials();
    await this.lightingFixtureDbService.deleteAllCustomMaterials();
  }

  /**
   * Resets the global ("All Assessments") settings to defaults, keeping the tutorial and print preferences
   * in {@link PRESERVED_GLOBAL_SETTINGS}, and resets user feature flags.
   */
  async restoreDefaultAppSettings(): Promise<void> {
    const allSettings: Array<Settings> = await firstValueFrom(this.settingsDbService.getAllSettings());
    const storedGlobalSettings: Settings | undefined = allSettings.find(settings => this.isFolderSettings(settings) && settings.directoryId === ROOT_DIRECTORY_ID);

    const defaultSettings: Settings = {
      ...getDefaultSettings(),
      ..._.pick(storedGlobalSettings, PRESERVED_GLOBAL_SETTINGS),
      directoryId: ROOT_DIRECTORY_ID,
      suiteDbItemsInitialized: true,
    };
    delete defaultSettings.facilityInfo;

    if (storedGlobalSettings) {
      await firstValueFrom(this.settingsDbService.updateWithObservable({ ...defaultSettings, id: storedGlobalSettings.id }));
    } else {
      // No global row in the database: create one from defaults rather than copying the in-memory settings,
      // which can lack an id and, in development builds, have tutorials forced off.
      await firstValueFrom(this.settingsDbService.addWithObservable(defaultSettings));
    }
    this.featureFlagService.restoreUserFlagsToDefault();
  }

  /**
   * Ids of the example rows in a folder: example items, the settings and calculators linked to them,
   * and the folder itself with its own settings.
   * @param stored Snapshot of stored rows.
   * @param exampleDirectoryId Id of the Examples folder.
   * @returns Ids to delete.
   */
  private getExampleDataIds(stored: StoredData, exampleDirectoryId: number): DirectoryDataIds {
    const isInExampleFolder = (item: { isExample?: boolean, directoryId?: number }) => item.isExample && item.directoryId === exampleDirectoryId;
    const ids: DirectoryDataIds = this.getItemDataIds(
      stored,
      stored.assessments.filter(isInExampleFolder),
      stored.inventoryItems.filter(isInExampleFolder),
      stored.diagrams.filter(isInExampleFolder)
    );
    ids.calculators = stored.calculators
      .filter(calculator => this.isExampleCalculator(calculator, stored, exampleDirectoryId))
      .map(calculator => calculator.id);
    ids.directories.push(exampleDirectoryId);
    ids.settings.push(...this.getFolderSettingsIds(stored, [exampleDirectoryId]));
    return ids;
  }

  /**
   * Older imports saved example calculators with the assessmentId from the example file instead of the new assessment's id,
   * so a calculator also counts as an example one when it sits in the Examples folder and isn't linked to a user assessment.
   * ImportService now links calculators to the new assessment id, so this fallback only matters for data imported before that fix.
   * Known limit: a stale calculator whose old id matches a user assessment is kept. Folder location can't settle it, because moving
   * or copying an assessment doesn't update its calculator's directoryId, so a folder rule would also delete the user's own calculators.
   * @param calculator A calculator row.
   * @param stored Snapshot of stored rows.
   * @param exampleDirectoryId Id of the Examples folder, if there is one.
   * @returns True when the calculator belongs to an example assessment in that folder.
   */
  private isExampleCalculator(calculator: Calculator, stored: StoredData, exampleDirectoryId: number | undefined): boolean {
    if (!calculator.assessmentId || exampleDirectoryId === undefined) {
      return false;
    }
    const assessment: Assessment | undefined = stored.assessments.find(assessment => assessment.id === calculator.assessmentId);
    if (assessment) {
      return assessment.isExample === true && assessment.directoryId === exampleDirectoryId;
    }
    return calculator.directoryId === exampleDirectoryId;
  }

  /**
   * Ids of all user-created rows: non-example items and their linked settings/calculators,
   * all calculators not tied to an example assessment, and every folder other than "All Assessments" and Examples, with its own settings.
   * @param stored Snapshot of stored rows.
   * @returns Ids to delete.
   */
  private getUserDataIds(stored: StoredData): DirectoryDataIds {
    const isUserItem = (item: { isExample?: boolean }) => !item.isExample;
    const ids: DirectoryDataIds = this.getItemDataIds(
      stored,
      stored.assessments.filter(isUserItem),
      stored.inventoryItems.filter(isUserItem),
      stored.diagrams.filter(isUserItem)
    );

    const userDirectoryIds: Array<number> = stored.directories
      .filter(directory => directory.id !== ROOT_DIRECTORY_ID && !directory.isExample)
      .map(directory => directory.id);
    ids.directories.push(...userDirectoryIds);
    ids.settings.push(...this.getFolderSettingsIds(stored, userDirectoryIds));
    // Examples ship no folder-level calculators (pre-assessments), so every calculator not tied to an example assessment is the user's.
    const exampleDirectoryId: number | undefined = stored.directories.find(directory => directory.isExample)?.id;
    ids.calculators = stored.calculators
      .filter(calculator => !this.isExampleCalculator(calculator, stored, exampleDirectoryId))
      .map(calculator => calculator.id);
    return ids;
  }

  /**
   * Ids of the given items plus the settings and calculators linked to them.
   * @param stored Snapshot of stored rows.
   * @param assessments Assessments to delete.
   * @param inventoryItems Inventories to delete.
   * @param diagrams Diagrams to delete.
   * @returns Ids to delete; `directories` is empty.
   */
  private getItemDataIds(stored: StoredData, assessments: Array<Assessment>, inventoryItems: Array<InventoryItem>, diagrams: Array<Diagram>): DirectoryDataIds {
    const assessmentIds: Array<number> = assessments.map(assessment => assessment.id);
    const inventoryIds: Array<number> = inventoryItems.map(item => item.id);
    const diagramIds: Array<number> = diagrams.map(diagram => diagram.id);
    return {
      assessments: assessmentIds,
      inventories: inventoryIds,
      diagrams: diagramIds,
      calculators: stored.calculators
        .filter(calculator => assessmentIds.includes(calculator.assessmentId))
        .map(calculator => calculator.id),
      settings: stored.settings
        .filter(settings => assessmentIds.includes(settings.assessmentId)
          || inventoryIds.includes(settings.inventoryId)
          || diagramIds.includes(settings.diagramId))
        .map(settings => settings.id),
      directories: [],
    };
  }

  /**
   * Ids of the folder-level settings rows (not linked to an item) of the given folders.
   * @param stored Snapshot of stored rows.
   * @param directoryIds Folder ids.
   * @returns Settings ids.
   */
  private getFolderSettingsIds(stored: StoredData, directoryIds: Array<number>): Array<number> {
    return stored.settings
      .filter(settings => this.isFolderSettings(settings) && directoryIds.includes(settings.directoryId))
      .map(settings => settings.id);
  }

  /**
   * @param settings A settings row.
   * @returns True when the row belongs to a folder rather than an assessment, inventory or diagram.
   */
  private isFolderSettings(settings: Settings): boolean {
    return !settings.assessmentId && !settings.inventoryId && !settings.diagramId;
  }

  /**
   * Moves user content (non-example items, folder calculators, sub-folders) out of a folder into "All Assessments".
   * @param stored Snapshot of stored rows.
   * @param fromDirectoryId Folder to empty of user content.
   */
  private async moveUserContentToRoot(stored: StoredData, fromDirectoryId: number): Promise<void> {
    const isUserItemInFolder = (item: { isExample?: boolean, directoryId?: number }) => !item.isExample && item.directoryId === fromDirectoryId;

    await Promise.all([
      ...stored.assessments.filter(isUserItemInFolder)
        .map(assessment => firstValueFrom(this.assessmentDbService.updateWithObservable({ ...assessment, directoryId: ROOT_DIRECTORY_ID }))),
      ...stored.inventoryItems.filter(isUserItemInFolder)
        .map(inventoryItem => firstValueFrom(this.inventoryDbService.updateWithObservable({ ...inventoryItem, directoryId: ROOT_DIRECTORY_ID }))),
      ...stored.diagrams.filter(isUserItemInFolder)
        .map(diagram => firstValueFrom(this.diagramIdbService.updateWithObservable({ ...diagram, directoryId: ROOT_DIRECTORY_ID }))),
      ...stored.calculators.filter(calculator => !calculator.assessmentId && calculator.directoryId === fromDirectoryId)
        .map(calculator => firstValueFrom(this.calculatorDbService.updateWithObservable({ ...calculator, directoryId: ROOT_DIRECTORY_ID }))),
      ...stored.directories.filter(directory => !directory.isExample && directory.parentDirectoryId === fromDirectoryId)
        .map(directory => firstValueFrom(this.directoryDbService.updateWithObservable({ ...directory, parentDirectoryId: ROOT_DIRECTORY_ID }))),
    ]);
  }

  /** @param ids Rows to delete, by store. */
  private async deleteRows(ids: DirectoryDataIds): Promise<void> {
    await Promise.all([
      firstValueFrom(this.assessmentDbService.bulkDeleteWithObservable(ids.assessments)),
      firstValueFrom(this.inventoryDbService.bulkDeleteWithObservable(ids.inventories)),
      firstValueFrom(this.diagramIdbService.bulkDeleteWithObservable(ids.diagrams)),
      firstValueFrom(this.calculatorDbService.bulkDeleteWithObservable(ids.calculators)),
      firstValueFrom(this.settingsDbService.bulkDeleteWithObservable(ids.settings)),
      firstValueFrom(this.directoryDbService.bulkDeleteWithObservable(ids.directories)),
    ]);
  }

  /**
   * Removes the rows a failed example load managed to save, so the database is left as it was.
   * @param partialExampleDirectory The new Examples folder, when the load got far enough to create it.
   */
  private async discardPartialExampleLoad(partialExampleDirectory: Directory | undefined): Promise<void> {
    if (!partialExampleDirectory) {
      return;
    }
    const storedAfterLoad: StoredData = await this.getStoredData();
    await this.deleteRows(this.getExampleDataIds(storedAfterLoad, partialExampleDirectory.id));
  }

  /** @returns Every stored row a reset can touch. */
  private async getStoredData(): Promise<StoredData> {
    // Assessments first: getAllAssessments may save version-migrated assessments and calculators, and the other stores
    // should be read after those writes. Its calculator save isn't awaited, so this narrows the race rather than closing it.
    const assessments: Array<Assessment> = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    const [directories, inventoryItems, diagrams, calculators, settings] = await Promise.all([
      firstValueFrom(this.directoryDbService.getAllDirectories()),
      firstValueFrom(this.inventoryDbService.getAllInventory()),
      firstValueFrom(this.diagramIdbService.getAllDiagrams()),
      firstValueFrom(this.calculatorDbService.getAllCalculators()),
      firstValueFrom(this.settingsDbService.getAllSettings()),
    ]);
    return { directories, assessments, inventoryItems, diagrams, calculators, settings };
  }

  /** Reloads the in-memory caches the app reads from, so screens show the reset data. Run once after the last step. */
  async refreshCaches(): Promise<void> {
    await Promise.all([
      this.directoryDbService.setAll(),
      this.assessmentDbService.setAll(),
      this.inventoryDbService.setAll(),
      this.diagramIdbService.setAll(),
      this.calculatorDbService.setAll(),
      this.settingsDbService.setAll(),
    ]);
  }
}
