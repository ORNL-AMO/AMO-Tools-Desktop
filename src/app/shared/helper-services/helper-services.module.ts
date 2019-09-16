import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonToCsvService } from './json-to-csv.service';
import { LineChartHelperService } from './line-chart-helper.service';
import { SvgToPngService } from './svg-to-png.service';
import { UpdateDataService } from './update-data.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    JsonToCsvService,
    LineChartHelperService,
    SvgToPngService,
    UpdateDataService
  ]
})
export class HelperServicesModule { }
