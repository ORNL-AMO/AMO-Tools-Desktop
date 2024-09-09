import { Injectable } from '@angular/core';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { firstValueFrom } from 'rxjs';
import { Directory } from './models/directory';

@Injectable({
  providedIn: 'root'
})
export class ManageAppDataService {

  constructor(
    private calculatorDbService: CalculatorDbService,
    private directoryDbService: DirectoryDbService, 
    private settingsDbService: SettingsDbService, 
    private assessmentDbService: AssessmentDbService,
    private inventoryDbService: InventoryDbService) { }


  /**
   * Delete all app data without dropping the database
   */
    async deleteAllAppData() {
      await this.deleteAllUserDirectories();
      await firstValueFrom(this.assessmentDbService.clearAllWithObservable());
      await firstValueFrom(this.inventoryDbService.clearAllWithObservable());
      await firstValueFrom(this.settingsDbService.clearAllWithObservable());
      await firstValueFrom(this.calculatorDbService.clearAllWithObservable());
    }

  /**
   * Delete all directories that are not the root directory
   */
    async deleteAllUserDirectories() {
      let allDirectories = await firstValueFrom(this.directoryDbService.getAllDirectories());
      // "All Assessments"  directory
      let mainDirectory: Directory;
      let allDirectoryIds: number[] = allDirectories.filter(dir => {
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
      this.directoryDbService.setAll(directories);
    }











}

