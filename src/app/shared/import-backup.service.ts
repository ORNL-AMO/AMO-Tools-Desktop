import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { MeasurBackupFile } from './backup-data.service';
import { ManageAppDataService } from './manage-app-data.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { AtmosphereDbService } from '../indexedDb/atmosphere-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../indexedDb/liquid-load-material-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SolidLiquidMaterialDbService } from '../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../indexedDb/solid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../indexedDb/wall-losses-surface-db.service';
import { Directory } from './models/directory';
import { Assessment } from './models/assessment';
import { InventoryItem } from './models/inventory/inventory';
import { Settings } from './models/settings';
import { Calculator } from './models/calculators';
import { SqlDbApiService } from '../tools-suite-api/sql-db-api.service';
import { Diagram } from './models/diagram';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';

@Injectable({
  providedIn: 'root'
})
export class ImportBackupService {
  showImportBackupModal: BehaviorSubject<boolean>;
  selectedImportFile: MeasurBackupFile;
  backupFileError: string;
  importName: string;
  importDirectoryIdMap: { [oldId: number]: number };
  // get new assessmentId from old
  importAssessmentIdMap: { [oldId: number]: number };
  // get new diagramId from old
  importDiagramIdMap: { [oldId: number]: number };
  // get new settings id from old directory id
  importDirectorySettingsIdMap: { [oldId: number]: number };
  // get new settings id from old assessment id
  importAssessmentSettingsIdMap: { [oldId: number]: number };
  // get new settings id from old diagram id
  importDiagramSettingsIdMap: { [oldId: number]: number };
  // get new settings id from old inventory id
  importInventorySettingsIdMap: { [oldId: number]: number };


  constructor(
    private calculatorDbService: CalculatorDbService,
    private directoryDbService: DirectoryDbService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private gasLoadDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private atmosphereDbService: AtmosphereDbService,
    private inventoryDbService: InventoryDbService,
    private manageAppDataService: ManageAppDataService,
    private sqlDbApiService: SqlDbApiService,
    private diagramDbService: DiagramIdbService,
    private dashboardService: DashboardService,
  ) {

    this.showImportBackupModal = new BehaviorSubject<boolean>(undefined);
  }

  getImportDate(date: Date): Date {
    //date imported with timestap cause problems.
    if (typeof date.getMonth === 'function') {
      return date;
    } else {
      let readDateString: string = String(date);
      //remove time stamp
      let newString: string = readDateString.split('T')[0];
      //Format: YYYY-MM-DD
      let yearMonthDate: Array<string> = newString.split('-');
      //Month 0 indexed (-1)
      if (yearMonthDate.length == 3) {
        return new Date(Number(yearMonthDate[0]), Number(yearMonthDate[1]) - 1, Number(yearMonthDate[2]));
      } else {
        return date;
      }
    }
  }


  async importBackupFile() {
    this.importDirectoryIdMap = {};
    this.importAssessmentIdMap = {};
    this.importDiagramIdMap = {};
    this.importDirectorySettingsIdMap = {};
    this.importAssessmentSettingsIdMap = {};
    this.importDiagramSettingsIdMap = {};
    this.importInventorySettingsIdMap = {};

    try {
      await this.manageAppDataService.deleteAllAppData();
      await this.importMeasurBackupFile(this.selectedImportFile);
      this.dashboardService.updateDashboardData.next(true);
    } catch (err) {
      console.log('Error importing backup file:', err);
      // todo 6925 eventually fallback to original data
    }
  }

  // async backupExistingData() {
  //   let newBackupFile = await this.backupDataService.getBackupFile();
  //   this.electronService.saveToFileSystem(newBackupFile);
  // }

  async importMeasurBackupFile(measurBackupFile: MeasurBackupFile) {
    // * delete current root directory settings
    await firstValueFrom(this.settingsDbService.deleteByIdWithObservable(1));

    for await (let settings of measurBackupFile.settings) {
      let oldDirectoryId = settings.directoryId;
      let oldAssessmentId = settings.assessmentId;
      let oldDiagramId = settings.diagramId;
      let oldInventoryid = settings.inventoryId;
      delete settings.id;
      delete settings.assessmentId;
      delete settings.directoryId;
      delete settings.diagramId;
      delete settings.inventoryId;

      // * set reassign imported root settings to current root directory
      if (oldDirectoryId === 1) {
        settings.directoryId = 1;
        oldDirectoryId = undefined;
      }

      let newSettings: Settings = await firstValueFrom(this.settingsDbService.addWithObservable(settings));
      if (oldAssessmentId !== undefined && oldAssessmentId !== null) {
        this.importAssessmentSettingsIdMap[oldAssessmentId] = newSettings.id;
      }

      if (oldDiagramId !== undefined && oldDiagramId !== null) {
        this.importDiagramSettingsIdMap[oldDiagramId] = newSettings.id;
      }

      if (oldDirectoryId !== undefined && oldDirectoryId !== null) {
        this.importDirectorySettingsIdMap[oldDirectoryId] = newSettings.id;
      }
      if (oldInventoryid !== undefined && oldInventoryid !== null) {
        this.importInventorySettingsIdMap[oldInventoryid] = newSettings.id;
      }
    };

    let settings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(settings);

    let userDirectories = measurBackupFile.directories.filter(dir => dir.id !== 1);
    for await (let directory of userDirectories) {
      directory.selected = false;
      let oldDirId = directory.id;
      delete directory.id;

      let newDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(directory));
      await this.updateRelatedDirectorySettings(newDirectory, oldDirId);
      this.importDirectoryIdMap[oldDirId] = newDirectory.id;
    };
    let directories = await firstValueFrom(this.directoryDbService.getAllDirectories());
    this.directoryDbService.setAll(directories);


    for await (let assessment of measurBackupFile.assessments) {
      assessment.selected = false;
      let oldAssessmentId = assessment.id;
      delete assessment.id;
      assessment.directoryId = assessment.directoryId === 1 ? assessment.directoryId : this.importDirectoryIdMap[assessment.directoryId];
      let newAssessment = await firstValueFrom(this.assessmentDbService.addWithObservable(assessment));

      await this.updateRelatedAssessmentSettings(newAssessment, oldAssessmentId);
      this.importAssessmentIdMap[oldAssessmentId] = newAssessment.id;
    };
    let assessments = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);

    for await (let diagram of measurBackupFile.diagrams) {
      diagram.selected = false;
      let oldDiagramId = diagram.id;
      delete diagram.id;
      diagram.directoryId = diagram.directoryId === 1 ? diagram.directoryId : this.importDirectoryIdMap[diagram.directoryId];
      diagram.assessmentId = this.importAssessmentIdMap[diagram.assessmentId];
      let newDiagram = await firstValueFrom(this.diagramDbService.addWithObservable(diagram));

      await this.updateRelatedDiagramSettings(newDiagram, oldDiagramId);
      this.importDiagramIdMap[oldDiagramId] = newDiagram.id;
    };
    let diagrams = await firstValueFrom(this.diagramDbService.getAllDiagrams());
    this.diagramDbService.setAll(diagrams);

    // * patch assessment diagram id
    for await (let assessment of this.assessmentDbService.dbAssessments.getValue()) {
      assessment.diagramId = this.importDiagramIdMap[assessment.diagramId];
      await firstValueFrom(this.settingsDbService.updateWithObservable(assessment));
    };
    assessments = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);


    for await (let calculator of measurBackupFile.calculators) {
      delete calculator.id;
      let oldAssessmentId = calculator.assessmentId;
      let oldDirectoryId = calculator.directoryId;
      delete calculator.assessmentId;
      delete calculator.directoryId;

      calculator.assessmentId = this.importAssessmentIdMap[oldAssessmentId];
      calculator.directoryId = this.importDirectoryIdMap[oldDirectoryId];
      await firstValueFrom(this.calculatorDbService.addWithObservable(calculator));
    };
    let allCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
    this.calculatorDbService.setAll(allCalculators);


    for await (let inventory of measurBackupFile.inventories) {
      inventory.selected = false;
      let oldInventoryId = inventory.id;
      delete inventory.id;
      inventory.directoryId = inventory.directoryId === 1 ? inventory.directoryId : this.importDirectoryIdMap[inventory.directoryId];
      let newInventory = await firstValueFrom(this.inventoryDbService.addWithObservable(inventory));
      await this.updateRelatedInventorySettings(newInventory, oldInventoryId);
    };
    let inventories = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(inventories);


    for await (let material of measurBackupFile.gasLoadChargeMaterials) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertGasLoadChargeMaterial(material);
      if (isAdded) {
        await firstValueFrom(this.gasLoadDbService.addWithObservable(material));
      }
    };

    for await (let material of measurBackupFile.liquidLoadChargeMaterials) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertLiquidLoadChargeMaterial(material);
      if (isAdded) {
        await firstValueFrom(this.liquidLoadMaterialDbService.addWithObservable(material));
      }
    };

    for await (let material of measurBackupFile.solidLoadChargeMaterials) {
      material.selected = false;
      delete material.id;
      await firstValueFrom(this.solidLoadMaterialDbService.addWithObservable(material));
    };

    for await (let material of measurBackupFile.atmosphereSpecificHeats) {
      material.selected = false;
      delete material.id;
      await firstValueFrom(this.atmosphereDbService.addWithObservable(material));
    };

    for await (let material of measurBackupFile.wallLossesSurfaces) {
      material.selected = false;
      delete material.id;
      await firstValueFrom(this.wallLossesSurfaceDbService.addWithObservable(material));
    };

    for await (let material of measurBackupFile.flueGasMaterials) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertGasFlueGasMaterial(material);
      if (isAdded) {
        await firstValueFrom(this.flueGasMaterialDbService.addWithObservable(material));
      }
    };

    for await (let material of measurBackupFile.solidLiquidFlueGasMaterials) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertSolidLiquidFlueGasMaterial(material);
      if (isAdded) {
        await firstValueFrom(this.solidLiquidMaterialDbService.addWithObservable(material));
      }
    };
  }

  async updateRelatedDirectorySettings(newDirectory: Directory, oldDirId: number) {
    if (this.importDirectorySettingsIdMap[oldDirId] !== undefined) {
      let settings: Settings = this.settingsDbService.findById(this.importDirectorySettingsIdMap[oldDirId]);
      settings.directoryId = newDirectory.id;
      await firstValueFrom(this.settingsDbService.updateWithObservable(settings));
    }
  }

  async updateRelatedDiagramSettings(newDiagram: Diagram, oldDiagramId: number) {
    if (this.importDiagramSettingsIdMap[oldDiagramId] !== undefined) {
      let settings: Settings = this.settingsDbService.findById(this.importDiagramSettingsIdMap[oldDiagramId]);
      settings.diagramId = newDiagram.id;
      await firstValueFrom(this.settingsDbService.updateWithObservable(settings));
    }
  }

  async updateRelatedAssessmentSettings(newAssessment: Assessment, oldAssessmentId: number) {
    if (this.importAssessmentSettingsIdMap[oldAssessmentId] !== undefined) {
      let settings: Settings = this.settingsDbService.findById(this.importAssessmentSettingsIdMap[oldAssessmentId]);
      settings.assessmentId = newAssessment.id;
      await firstValueFrom(this.settingsDbService.updateWithObservable(settings));
    }
  }

  async updateRelatedInventorySettings(inventoryItem: InventoryItem, oldInventoryId: number) {
    if (this.importInventorySettingsIdMap[oldInventoryId] !== undefined) {
      let settings: Settings = this.settingsDbService.findById(this.importInventorySettingsIdMap[oldInventoryId]);
      settings.inventoryId = inventoryItem.id;
      await firstValueFrom(this.settingsDbService.updateWithObservable(settings));
    }
  }


}
