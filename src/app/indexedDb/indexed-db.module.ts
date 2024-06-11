import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { dbConfig } from './dbConfig';
 
import { AssessmentDbService } from './assessment-db.service';
import { DirectoryDbService } from './directory-db.service';
import { SettingsDbService } from './settings-db.service';
import { CalculatorDbService } from './calculator-db.service';
import { DeleteDataService } from './delete-data.service';
import { InventoryDbService } from './inventory-db.service';
import { WallLossesSurfaceDbService } from './wall-losses-surface-db.service';
import { LogToolIdbService } from './log-tool-idb.service';
import { GasLoadMaterialDbService } from './gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from './liquid-load-material-db.service';
import { SolidLoadMaterialDbService } from './solid-load-material-db.service';
import { SolidLiquidMaterialDbService } from './solid-liquid-material-db.service';
import { FlueGasMaterialDbService } from './flue-gas-material-db.service';
import { AtmosphereDbService } from './atmosphere-db.service';
import { WeatherDataIdbService } from './weather-data-idb.service';
import { WaterProcessIdbService } from './water-process-idb.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxIndexedDBModule.forRoot(dbConfig),
  ],
  providers: [
    AssessmentDbService,
    DirectoryDbService,
    SettingsDbService,
    CalculatorDbService,
    DeleteDataService,
    InventoryDbService,
    LogToolIdbService,
    WallLossesSurfaceDbService,
    GasLoadMaterialDbService,
    LiquidLoadMaterialDbService,
    SolidLoadMaterialDbService,
    SolidLiquidMaterialDbService,
    FlueGasMaterialDbService,
    AtmosphereDbService,
    WeatherDataIdbService,
    WaterProcessIdbService
  ]
})
export class IndexedDbModule { }
