import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WasteWaterAnalysisService } from './waste-water-analysis.service';
import { SrtGraphComponent } from './waste-water-graphs/srt-graph/srt-graph.component';
import { EnergyAnalysisComponent } from './energy-analysis/energy-analysis.component';
import { EnergyAnalysisTableComponent } from './energy-analysis/energy-analysis-table/energy-analysis-table.component';
import { EnergyAnalysisBarChartComponent } from './energy-analysis/energy-analysis-bar-chart/energy-analysis-bar-chart.component';
import { WasteWaterAnalysisComponent } from './waste-water-analysis.component';
import { WasteWaterCalculationsTableComponent } from './waste-water-calculations-table/waste-water-calculations-table.component';
import { WasteWaterGraphsComponent } from './waste-water-graphs/waste-water-graphs.component';

@NgModule({
  declarations: [
    SrtGraphComponent,
    EnergyAnalysisComponent,
    EnergyAnalysisTableComponent,
    EnergyAnalysisBarChartComponent,
    WasteWaterAnalysisComponent,
    WasteWaterCalculationsTableComponent,
    WasteWaterGraphsComponent,
  ],
  imports: [
    CommonModule
  ],
  providers: [
    WasteWaterAnalysisService
  ],
  exports: [
    WasteWaterAnalysisComponent,
    SrtGraphComponent,
    EnergyAnalysisComponent
  ]
})
export class WasteWaterAnalysisModule { }
