import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtDiagramTabComponent } from './ssmt-diagram-tab.component';
import { DiagramSummaryTableComponent } from './diagram-summary-table/diagram-summary-table.component';
import { DiagramHelpComponent } from './diagram-help/diagram-help.component';
import { CostTableComponent } from './cost-table/cost-table.component';
import { FlashTankTableComponent } from './flash-tank-table/flash-tank-table.component';
import { DeaeratorTableComponent } from './deaerator-table/deaerator-table.component';
import { BoilerTableComponent } from './boiler-table/boiler-table.component';
import { PrvTableComponent } from './prv-table/prv-table.component';
import { TurbineTableComponent } from './turbine-table/turbine-table.component';
import { SsmtDiagramModule } from '../ssmt-diagram/ssmt-diagram.module';
import { FormsModule } from '@angular/forms';
import { BoilerModule } from '../../calculator/steam/boiler/boiler.module';
import { SsmtDiagramTabService } from './ssmt-diagram-tab.service';
import { TurbineModule } from '../../calculator/steam/turbine/turbine.module';
import { DeaeratorModule } from '../../calculator/steam/deaerator/deaerator.module';
import { PrvModule } from '../../calculator/steam/prv/prv.module';
import { FlashTankModule } from '../../calculator/steam/flash-tank/flash-tank.module';
import { HeatExchangerTableComponent } from './heat-exchanger-table/heat-exchanger-table.component';
import { HoverTableModule } from '../ssmt-diagram/hover-table/hover-table.module';
import { ResultsTableComponent } from './results-table/results-table.component';
import { ExportableResultsTableModule } from '../../shared/exportable-results-table/exportable-results-table.module';
import { SharedPipesModule } from '../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    SsmtDiagramModule,
    FormsModule,
    BoilerModule,
    TurbineModule,
    DeaeratorModule,
    PrvModule,
    FlashTankModule,
    HoverTableModule,
    ExportableResultsTableModule,
    SharedPipesModule
  ],
  declarations: [
    SsmtDiagramTabComponent,
    BoilerTableComponent,
    DeaeratorTableComponent,
    FlashTankTableComponent,
    PrvTableComponent,
    TurbineTableComponent,
    DiagramHelpComponent,
    CostTableComponent,

    DiagramSummaryTableComponent,

    HeatExchangerTableComponent,

    ResultsTableComponent,
  ],
  exports: [
    SsmtDiagramTabComponent
  ],
  providers: [
    SsmtDiagramTabService
  ]
})
export class SsmtDiagramTabModule { }
