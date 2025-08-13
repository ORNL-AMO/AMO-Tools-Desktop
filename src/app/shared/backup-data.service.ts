import { Injectable } from '@angular/core';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { Assessment } from './models/assessment';
import { Directory } from './models/directory';
import { Calculator } from './models/calculators';
import { InventoryItem } from './models/inventory/inventory';
import { AtmosphereDbService } from '../indexedDb/atmosphere-db.service';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../indexedDb/liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../indexedDb/solid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../indexedDb/wall-losses-surface-db.service';
import { AtmosphereSpecificHeat, FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial, SuiteDbMotor, SuiteDbPump, WallLossesSurface } from './models/materials';
import { ApplicationInstanceDbService } from '../indexedDb/application-instance-db.service';
import { Settings } from './models/settings';
import { firstValueFrom } from 'rxjs';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Diagram } from './models/diagram';

@Injectable({
  providedIn: 'root'
})
export class BackupDataService {

  constructor(private assessmentDbService: AssessmentDbService,
    private applicationInstanceDbService: ApplicationInstanceDbService,
    private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private inventoryDbService: InventoryDbService,
    private directoryDbService: DirectoryDbService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private gasLoadMaterialDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private diagramDbService: DiagramIdbService,
    private atmosphereDbService: AtmosphereDbService,
  ) { }


  async getBackupFile(): Promise<MeasurBackupFile> {
    let applicationInstanceData = this.applicationInstanceDbService.applicationInstanceData.getValue();
    let backupName = 'MEASUR_Backup_Data';
    let backupFile: MeasurBackupFile = {
      filename: backupName,
      dataBackupFilePath: applicationInstanceData?.dataBackupFilePath,
      origin: "AMO-TOOLS-DESKTOP",
      timeStamp: new Date(),
      dataBackupId: Math.random().toString(36).substr(2, 9),
      directories: this.getDirectories(this.directoryDbService.dbDirectories.getValue()),
      assessments: this.getAssessments(this.assessmentDbService.dbAssessments.getValue()),
      diagrams: this.getDiagrams(this.diagramDbService.dbDiagrams.getValue()),
      calculators: await firstValueFrom(this.calculatorDbService.getAllCalculators()),
      inventories: this.getInventories(this.inventoryDbService.dbInventories.getValue()),
      settings: this.getSettings(this.settingsDbService.dbSettings.getValue()),
    };

    await this.setCustomMaterials(backupFile);
    return backupFile;
  }

  /**
 * Return all directories isolated - with sub directories and examples removed
 */
  getDirectories(directories: Directory[]) {
    // directories = this.removeExamples(directories);
    directories = directories.map(dir => {
      if (dir.subDirectory) {
        delete dir.subDirectory;
      }
      return dir;
    })

    return directories;
  }

  getAssessments(assessments: Array<Assessment>) {
    // assessments = this.removeExamples(assessments) as Array<Assessment>;
    return assessments;
  }

  getDiagrams(diagrams: Array<Diagram>) {
    // diagrams = this.removeExamples(diagrams) as Array<Diagram>;
    return diagrams;
  }


  getInventories(inventories: Array<InventoryItem>) {
    // inventories = this.removeExamples(inventories) as Array<InventoryItem>;
    return inventories;
  }

  getSettings(settings: Array<Settings>) {
    // inventories = this.removeExamples(inventories) as Array<InventoryItem>;
    return settings;
  }

  removeExamples(measurDbData: Array<Directory | Assessment | InventoryItem>) {
    return measurDbData.filter(dbData => {
      if (!dbData.isExample) {
        return dbData;
      }
    })
  }

  async setCustomMaterials(backupFile: MeasurBackupFile) {
    backupFile.gasLoadChargeMaterials = await firstValueFrom(this.gasLoadMaterialDbService.getAllWithObservable());
    backupFile.liquidLoadChargeMaterials = await firstValueFrom(this.liquidLoadMaterialDbService.getAllWithObservable());
    backupFile.solidLoadChargeMaterials = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable());
    backupFile.atmosphereSpecificHeats = await firstValueFrom(this.atmosphereDbService.getAllWithObservable());
    backupFile.wallLossesSurfaces = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
    backupFile.flueGasMaterials = await firstValueFrom(this.flueGasMaterialDbService.getAllWithObservable());
    backupFile.solidLiquidFlueGasMaterials = await firstValueFrom(this.solidLiquidMaterialDbService.getAllWithObservable());
  }
  
  async downloadBackupFile() {
    let backupFile: MeasurBackupFile = await this.getBackupFile();
    let stringifyData = JSON.stringify(backupFile);
    let dlLink = window.document.createElement("a");
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(stringifyData);
    dlLink.setAttribute("href", dataStr);
    dlLink.setAttribute('download', backupFile.filename + '.json');
    dlLink.click();
  }
}

export interface MeasurBackupFile {
  filename: string,
  origin: string,
  dataBackupFilePath?: string,
  timeStamp: Date,
  dataBackupId: string,
  assessments?: Assessment[],
  diagrams?: Diagram[],
  directories?: Directory[],
  inventories?: InventoryItem[],
  settings: Settings[],
  calculators?: Calculator[],
  flueGasMaterials?: FlueGasMaterial[],
  gasLoadChargeMaterials?: GasLoadChargeMaterial[],
  liquidLoadChargeMaterials?: LiquidLoadChargeMaterial[],
  solidLiquidFlueGasMaterials?: SolidLiquidFlueGasMaterial[],
  solidLoadChargeMaterials?: SolidLoadChargeMaterial[],
  atmosphereSpecificHeats?: AtmosphereSpecificHeat[],
  wallLossesSurfaces?: WallLossesSurface[],
}

