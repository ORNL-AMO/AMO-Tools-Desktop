import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateDataService } from './update-data.service';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { CsvToJsonService } from './csv-to-json.service';
import { EGridService } from './e-grid.service';
import { AirPropertiesCsvService } from './air-properties-csv.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    UpdateDataService,
    ConvertUnitsService,
    CsvToJsonService,
    EGridService,
    AirPropertiesCsvService
  ]
})
export class HelperServicesModule { }
