import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogToolComponent } from './log-tool.component';
import { LogToolBannerComponent } from './log-tool-banner/log-tool-banner.component';
import { RouterModule } from '@angular/router';
import { LogToolService } from './log-tool.service';
import { SystemSetupComponent } from './system-setup/system-setup.component';
import { HelpPanelComponent } from './system-setup/help-panel/help-panel.component';
import { VisualizeComponent } from './visualize/visualize.component';
import { SetupDataComponent } from './system-setup/setup-data/setup-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CleanDataComponent } from './system-setup/clean-data/clean-data.component';
import { DayTypeAnalysisComponent } from './day-type-analysis/day-type-analysis.component';
import { DayTypesComponent } from './day-type-analysis/day-types/day-types.component';
import { DayTypeGraphComponent } from './day-type-analysis/day-type-graph/day-type-graph.component';
import { DayTypeCalendarComponent } from './day-type-analysis/day-type-calendar/day-type-calendar.component';
import { DayTypeAnalysisService } from './day-type-analysis/day-type-analysis.service';
import { DayTypeGraphService } from './day-type-analysis/day-type-graph/day-type-graph.service';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { VisualizeTabsComponent } from './visualize/visualize-tabs/visualize-tabs.component';
import { VisualizeGraphComponent } from './visualize/visualize-graph/visualize-graph.component';
import { VisualizeDataComponent } from './visualize/visualize-data/visualize-data.component';
import { VisualizeService } from './visualize/visualize.service';
import { VisualizeMenuComponent } from './visualize/visualize-menu/visualize-menu.component';
import { LogToolDataService } from './log-tool-data.service';
import { DayTypeTableComponent } from './day-type-analysis/day-type-table/day-type-table.component';
import { DayTypeMenuComponent } from './day-type-analysis/day-type-menu/day-type-menu.component';
import { DataTableComponent } from './system-setup/setup-data/data-table/data-table.component';
import { FieldUnitsModalComponent } from './system-setup/clean-data/field-units-modal/field-units-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ExportableResultsTableModule } from '../shared/exportable-results-table/exportable-results-table.module';
import { AnnotateGraphComponent } from './visualize/visualize-menu/annotate-graph/annotate-graph.component';
import { GraphBasicsComponent } from './visualize/visualize-menu/graph-basics/graph-basics.component';
import { XAxisDataComponent } from './visualize/visualize-menu/x-axis-data/x-axis-data.component';
import { YAxisDataComponent } from './visualize/visualize-menu/y-axis-data/y-axis-data.component';
import { VisualizeMenuService } from './visualize/visualize-menu/visualize-menu.service';
import { VisualizeHelpComponent } from './visualize/visualize-help/visualize-help.component';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { DayTypeSummaryTableComponent } from './day-type-analysis/day-type-table/day-type-summary-table/day-type-summary-table.component';
import { IndividualDaySummaryTableComponent } from './day-type-analysis/day-type-table/individual-day-summary-table/individual-day-summary-table.component';
import { SelectedDataTableComponent } from './day-type-analysis/day-type-table/selected-data-table/selected-data-table.component';
import { BinDataComponent } from './visualize/visualize-menu/bin-data/bin-data.component';
import { LogToolDbService } from './log-tool-db.service';
import { SelectAssessmentModalComponent } from './day-type-analysis/day-type-menu/select-assessment-modal/select-assessment-modal.component';
import { ExportModalComponent } from './export-modal/export-modal.component';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';

@NgModule({
  declarations: [
    LogToolComponent,
    LogToolBannerComponent,
    SystemSetupComponent,
    HelpPanelComponent,
    VisualizeComponent,
    SetupDataComponent,
    CleanDataComponent,
    DayTypeAnalysisComponent,
    DayTypesComponent,
    DayTypeGraphComponent,
    DayTypeCalendarComponent,
    VisualizeTabsComponent,
    VisualizeGraphComponent,
    VisualizeDataComponent,
    VisualizeMenuComponent,
    DayTypeTableComponent,
    DayTypeMenuComponent,
    DataTableComponent,
    FieldUnitsModalComponent,
    AnnotateGraphComponent,
    GraphBasicsComponent,
    XAxisDataComponent,
    YAxisDataComponent,
    VisualizeHelpComponent,
    IndividualDaySummaryTableComponent,
    DayTypeSummaryTableComponent,
    SelectedDataTableComponent,
    BinDataComponent,
    SelectAssessmentModalComponent,
    ExportModalComponent,
    WelcomeScreenComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    ModalModule,
    ExportableResultsTableModule,
    SharedPipesModule
  ],
  providers: [
    LogToolService,
    DayTypeAnalysisService,
    DayTypeGraphService,
    VisualizeService,
    LogToolDataService,
    VisualizeMenuService,
    LogToolDbService
  ]
})
export class LogToolModule { }
