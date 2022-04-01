import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { dbConfig } from './dbConfig';
import { IndexedDbService } from './indexed-db.service';
import { AssessmentDbService } from './assessment-db.service';
import { DirectoryDbService } from './directory-db.service';
import { SettingsDbService } from './settings-db.service';
import { CalculatorDbService } from './calculator-db.service';
import { DeleteDataService } from './delete-data.service';
import { InventoryDbService } from './inventory-db.service';
import { WallLossesSurfaceDbService } from './wall-losses-surface-db.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxIndexedDBModule.forRoot(dbConfig),
  ],
  providers: [
    IndexedDbService,
    AssessmentDbService,
    DirectoryDbService,
    SettingsDbService,
    CalculatorDbService,
    DeleteDataService,
    WallLossesSurfaceDbService,
    InventoryDbService
  ]
})
export class IndexedDbModule { }
