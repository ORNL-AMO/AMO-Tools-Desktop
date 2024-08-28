import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { DashboardService } from '../dashboard/dashboard.service';
import { ElectronService } from '../electron/electron.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { AtmosphereDbService } from '../indexedDb/atmosphere-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../indexedDb/gas-load-material-db.service';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { LiquidLoadMaterialDbService } from '../indexedDb/liquid-load-material-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SolidLiquidMaterialDbService } from '../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../indexedDb/solid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../indexedDb/wall-losses-surface-db.service';
import { AppErrorService } from './errors/app-error.service';
import { DirectoryDataIds } from '../settings/assessment-settings/reset-data-modal/reset-data-modal.component';
import { Assessment } from './models/assessment';
import { firstValueFrom } from 'rxjs';
import { Directory } from './models/directory';

@Injectable({
  providedIn: 'root'
})
export class ManageAppDataService {

  constructor(private dashboardService: DashboardService, 
    private electronService: ElectronService,
    private calculatorDbService: CalculatorDbService,
    private directoryDbService: DirectoryDbService, 
    private settingsDbService: SettingsDbService, 
    private dbService: NgxIndexedDBService,
    private assessmentDbService: AssessmentDbService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private gasLoadDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private atmosphereDbService: AtmosphereDbService,
    private appErrorService: AppErrorService,
    private inventoryDbService: InventoryDbService) { }



    async deleteAllAppData() {
      let allDirectories = await firstValueFrom(this.directoryDbService.getAllDirectories());
      // "All Assessments" 
      let mainDirectory: Directory;
      let allDirectoryIds: number[] = allDirectories.filter(dir => {
        console.log(dir.id);
        if (dir.id === 1) {
          mainDirectory = dir;
          return false;
        }
        return true;
      }).map(dir => dir.id);
      await firstValueFrom(this.directoryDbService.bulkDeleteWithObservable(allDirectoryIds));

      delete mainDirectory.assessments;
      delete mainDirectory.subDirectory;
      delete mainDirectory.calculators;
      delete mainDirectory.treasureHunt;
      delete mainDirectory.inventories;
      delete mainDirectory.collapsed;

      await firstValueFrom(this.directoryDbService.updateWithObservable(mainDirectory));
      let directories = await firstValueFrom(this.directoryDbService.getAllDirectories());
      console.log('db directories after delete', directories)
      this.directoryDbService.setAll(directories);

;     let assessmentsIsCleared: boolean = await firstValueFrom(this.assessmentDbService.clearAllWithObservable());
      let inventoriesIsCleared:  boolean = await firstValueFrom(this.inventoryDbService.clearAllWithObservable());
      let settingsisCleared:  boolean = await firstValueFrom(this.settingsDbService.clearAllWithObservable());
      // let calculatorsisCleared:  boolean = await firstValueFrom(this.calculatorDbService.clearAllWithObservable());
    }

    
// getAllEntitiesAndDataIds(deleteExamples: boolean = false, dirId?: number): DirectoryDataIds {
//   let assessmentsIds: Array<number> = [];
//   let inventoryIds: Array<number> = [];
//   let settingsIds: Array<number> = [];
//   let calculatorIds: Array<number> = [];
//   for (let index: number = 0; index < this.assessmentDbService.dbAssessments.getValue().length; index++) {
//     let assessment: Assessment = this.assessmentDbService.allAssessments[index];
//     if (deleteExamples && assessment.isExample && dirId === assessment.directoryId) {
//       assessmentsIds.push(assessment.id);
//       settingsIds.push(this.settingsDbService.allSettings.find(settings => { return settings.assessmentId == assessment.id }).id);
//       let assessmentCalculator = this.calculatorDbService.allCalculators.find(calculator => { return calculator.assessmentId == assessment.id });
//       if (assessmentCalculator) {
//         calculatorIds.push(assessmentCalculator.id);
//       }
//     } else if (!deleteExamples && !assessment.isExample) {
//       assessmentsIds.push(assessment.id);
//       settingsIds.push(this.settingsDbService.allSettings.find(settings => { return settings.assessmentId == assessment.id }).id);
//       let assessmentCalculator = this.calculatorDbService.allCalculators.find(calculator => { return calculator.assessmentId == assessment.id });
//       if (assessmentCalculator) {
//         calculatorIds.push(assessmentCalculator.id);
//       }
//     }
//   }
//   return {
//     assessments: assessmentsIds, 
//     inventories: inventoryIds,
//     settings: settingsIds, 
//     calculators: calculatorIds
//   }
// }









}

