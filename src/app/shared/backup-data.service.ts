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
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../indexedDb/application-instance-db.service';
import { DatePipe } from '@angular/common';
import { Settings } from './models/settings';
import { firstValueFrom } from 'rxjs';

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
    private atmosphereDbService: AtmosphereDbService,
  ) { }

  // todo 6925, move to autobackup service?
  async getBackupFile(): Promise<MeasurBackupFile> {
    let applicationInstanceData = this.applicationInstanceDbService.applicationInstanceData.getValue();
    console.log('getBackupFile applicationInstanceData', applicationInstanceData)
    let backupName = 'MEASUR_Backup_Data';
    let backupFile: MeasurBackupFile = {
      filename: backupName,
      dataBackupFilePath: applicationInstanceData?.dataBackupFilePath,
      origin: "AMO-TOOLS-DESKTOP",
      timeStamp: new Date(),
      dataBackupId: Math.random().toString(36).substr(2, 9),
      directories: this.getDirectories(this.directoryDbService.dbDirectories.getValue()),
      assessments: this.getAssessments(this.assessmentDbService.dbAssessments.getValue()),
      calculators: await firstValueFrom(this.calculatorDbService.getAllCalculators()),
      inventories: this.getInventories(this.inventoryDbService.dbInventories.getValue()),
      settings: this.getSettings(this.settingsDbService.dbSettings.getValue()),
    };

    await this.setCustomMaterials(backupFile);
    console.log('getBackupFile', backupFile);
    return backupFile;
  }

  /**
 * Return all directories with sub directories and examples removed
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

  getInventories(inventories: Array<InventoryItem>) {
    // inventories = this.removeExamples(inventories) as Array<InventoryItem>;
    return inventories;
  }

  getSettings(settings: Array<Settings>) {
    // inventories = this.removeExamples(inventories) as Array<InventoryItem>;
    return settings;
  }

  async setCustomMaterials(backupFile: MeasurBackupFile) {
    let gasLoadChargeMaterials: GasLoadChargeMaterial[] = await firstValueFrom(this.gasLoadMaterialDbService.getAllWithObservable());
    let liquidLoadChargeMaterials: LiquidLoadChargeMaterial[] = await firstValueFrom(this.liquidLoadMaterialDbService.getAllWithObservable());
    let solidLoadChargeMaterials: SolidLoadChargeMaterial[] = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable());
    let atmosphereSpecificHeats: AtmosphereSpecificHeat[] = await firstValueFrom(this.atmosphereDbService.getAllWithObservable());
    let wallLossesSurfaces: WallLossesSurface[] = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
    let flueGasMaterials: FlueGasMaterial[] = await firstValueFrom(this.flueGasMaterialDbService.getAllWithObservable());
    let solidLiquidFlueGasMaterials: SolidLiquidFlueGasMaterial[] = await firstValueFrom(this.solidLiquidMaterialDbService.getAllWithObservable());
    backupFile.gasLoadChargeMaterials = gasLoadChargeMaterials? gasLoadChargeMaterials : [];
    backupFile.liquidLoadChargeMaterials = liquidLoadChargeMaterials? liquidLoadChargeMaterials : [];
    backupFile.solidLoadChargeMaterials = solidLoadChargeMaterials? solidLoadChargeMaterials : [];
    backupFile.atmosphereSpecificHeats = atmosphereSpecificHeats? atmosphereSpecificHeats : [];
    backupFile.wallLossesSurfaces = wallLossesSurfaces? wallLossesSurfaces : [];
    backupFile.flueGasMaterials = flueGasMaterials? flueGasMaterials : [];
    backupFile.solidLiquidFlueGasMaterials = solidLiquidFlueGasMaterials? solidLiquidFlueGasMaterials : [];
  }

  removeExamples(measurDbData: Array<Directory | Assessment | InventoryItem>) {
    return measurDbData.filter(dbData => {
      if (!dbData.isExample) {
        return dbData;
      }
    })
  }

  getTimeStampedFileName(filename: string) {
    const date = new Date();
    let datePipe: DatePipe = new DatePipe(navigator.language);
    let stringFormat: string = 'shortTime';
    let timeStr = datePipe.transform(date, stringFormat);
    timeStr = timeStr.replace(':', '_').replace(' ', '_').replace('.', '_');
    const dateStr = ('_' + (date.getMonth() + 1)) + '-' + date.getDate() + '-' + date.getFullYear();
    return filename + dateStr + timeStr + '.json';
  }

  setVersionedFileName(backupFile: MeasurBackupFile, applicationInstanceData: ApplicationInstanceData) {
    let filename: string = applicationInstanceData.dataBackupFilePath.substring(0, applicationInstanceData.dataBackupFilePath.length - 5);
    console.log('versioned filename', filename)
    const versionedBackupName = this.getTimeStampedFileName(filename)
    backupFile.filename = versionedBackupName;
    backupFile.dataBackupFilePath = versionedBackupName;
    console.log('versioned backupname', versionedBackupName)
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

  // getGUID(): string {
  //   return Math.random().toString(36).substr(2, 9);
  // }

  // getNewId(oldId: string, GUIDs: Array<{ oldId: string, newId: string }>): string {
  //   let GUID: string = GUIDs.find(id => { return id.oldId == oldId })?.newId;
  //   return GUID;
  // }


}

export interface MeasurBackupFile {
  filename: string,
  origin: string,
  dataBackupFilePath?: string,
  timeStamp: Date,
  dataBackupId: string,
  assessments?: Assessment[],
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

