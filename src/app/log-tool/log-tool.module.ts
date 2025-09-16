import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogToolComponent } from './log-tool.component';
import { LogToolBannerComponent } from './log-tool-banner/log-tool-banner.component';
import { RouterModule } from '@angular/router';
import { LogToolService } from './log-tool.service';
import { VisualizeComponent } from './visualize/visualize.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { LogToolDataService } from './log-tool-data.service';
import { DayTypeTableComponent } from './day-type-analysis/day-type-table/day-type-table.component';
import { DayTypeMenuComponent } from './day-type-analysis/day-type-menu/day-type-menu.component';
import { FieldUnitsModalComponent } from './data-setup/field-units-modal/field-units-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ExportableResultsTableModule } from '../shared/exportable-results-table/exportable-results-table.module';
import { VisualizeHelpComponent } from './visualize/visualize-help/visualize-help.component';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { DayTypeSummaryTableComponent } from './day-type-analysis/day-type-table/day-type-summary-table/day-type-summary-table.component';
import { IndividualDaySummaryTableComponent } from './day-type-analysis/day-type-table/individual-day-summary-table/individual-day-summary-table.component';
import { SelectedDataTableComponent } from './day-type-analysis/day-type-table/selected-data-table/selected-data-table.component';
import { BinDataComponent } from './visualize/visualize-sidebar/bin-data/bin-data.component';
import { LogToolDbService } from './log-tool-db.service';
import { SelectAssessmentModalComponent } from './day-type-analysis/day-type-menu/select-assessment-modal/select-assessment-modal.component';
import { ExportModalComponent } from './export-modal/export-modal.component';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { DataSetupComponent } from './data-setup/data-setup.component';
import { ImportDataComponent } from './data-setup/import-data/import-data.component';
import { RefineDataComponent } from './data-setup/refine-data/refine-data.component';
import { SelectDataHeaderComponent } from './data-setup/select-data-header/select-data-header.component';
import { MapTimeDataComponent } from './data-setup/map-time-data/map-time-data.component';
import { UserMessageOverlayModule } from '../shared/user-message-overlay/user-message-overlay.module';
import { DateFormatHelpModule } from '../shared/date-format-help/date-format-help.module';
import { VisualizeSidebarComponent } from './visualize/visualize-sidebar/visualize-sidebar.component';
import { GraphDataSelectionComponent } from './visualize/visualize-sidebar/graph-data-selection/graph-data-selection.component';
import { GraphSeriesComponent } from './visualize/visualize-sidebar/graph-series/graph-series.component';
import { GraphAnnotationsComponent } from './visualize/visualize-sidebar/graph-annotations/graph-annotations.component';
import { GraphSeriesManagementComponent } from './visualize/visualize-sidebar/graph-series-management/graph-series-management.component';
import { VisualizeSidebarService } from './visualize/visualize-sidebar/visualize-sidebar.service';
import { ImportExportModule } from '../shared/import-export/import-export.module';

@NgModule({
  declarations: [
    LogToolComponent,
    LogToolBannerComponent,
    VisualizeComponent,
    DayTypeAnalysisComponent,
    DayTypesComponent,
    DayTypeGraphComponent,
    DayTypeCalendarComponent,
    VisualizeTabsComponent,
    VisualizeGraphComponent,
    VisualizeDataComponent,
    DayTypeTableComponent,
    DayTypeMenuComponent,
    FieldUnitsModalComponent,
    VisualizeHelpComponent,
    IndividualDaySummaryTableComponent,
    DayTypeSummaryTableComponent,
    SelectedDataTableComponent,
    BinDataComponent,
    SelectAssessmentModalComponent,
    ExportModalComponent,
    WelcomeScreenComponent,
    DataSetupComponent,
    ImportDataComponent,
    RefineDataComponent,
    SelectDataHeaderComponent,
    MapTimeDataComponent,
    VisualizeSidebarComponent,
    GraphDataSelectionComponent,
    GraphSeriesComponent,
    GraphAnnotationsComponent,
    GraphSeriesManagementComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule,
    ModalModule,
    ExportableResultsTableModule,
    UserMessageOverlayModule,
    SharedPipesModule,
    DateFormatHelpModule,
    ImportExportModule
  ],
  providers: [
    LogToolService,
    DayTypeAnalysisService,
    DayTypeGraphService,
    VisualizeService,
    LogToolDataService,
    VisualizeSidebarService,
    LogToolDbService
  ]
})
export class LogToolModule { }
