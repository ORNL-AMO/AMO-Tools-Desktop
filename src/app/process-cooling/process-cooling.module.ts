import { NgModule } from '@angular/core';
import { ImportExportModule } from '../shared/import-export/import-export.module';
import { Co2HelpTextModule } from '../shared/co2-help-text/co2-help-text.module';
import { AssessmentCo2SavingsModule } from '../shared/assessment-co2-savings/assessment-co2-savings.module';
import { ExportableResultsTableModule } from '../shared/exportable-results-table/exportable-results-table.module';
import { SharedPipesModule } from '../shared/shared-pipes/shared-pipes.module';
import { UpdateUnitsModalModule } from '../shared/update-units-modal/update-units-modal.module';
import { ConfirmDeleteModalModule } from '../shared/confirm-delete-modal/confirm-delete-modal.module';
import { TabsTooltipModule } from '../shared/tabs-tooltip/tabs-tooltip.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsModule } from '../settings/settings.module';
import { RouterModule } from '@angular/router';
import { ProcessCoolingService } from './process-cooling.service';
import { ProcessCoolingComponent } from './process-cooling.component';
import { ProcessCoolingBannerComponent } from './process-cooling-banner/process-cooling-banner.component';
import { SetupTabsComponent } from './process-cooling-banner/setup-tabs/setup-tabs.component';
import { PercentGraphModule } from '../shared/percent-graph/percent-graph.module';
import { CommonModule } from '@angular/common';
import { SystemBasicsFormService } from './system-basics/system-basics-form.service';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { ConvertProcessCoolingService } from './convert-process-cooling.service';
import { ProcessCoolingReportComponent } from './process-cooling-report/process-cooling-report.component';
import { ProcessCoolingReportService } from './process-cooling-report/process-cooling-report.service';



@NgModule({
   declarations: [
    ProcessCoolingComponent,
    SetupTabsComponent,
    ProcessCoolingBannerComponent,
    SystemBasicsComponent,
    ProcessCoolingReportComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SettingsModule,
    ReactiveFormsModule,
    FormsModule,
    ModalModule,
    NgbModule,
    TabsTooltipModule,
    ConfirmDeleteModalModule, 
    UpdateUnitsModalModule,
    SharedPipesModule,
    ExportableResultsTableModule,
    AssessmentCo2SavingsModule,
    Co2HelpTextModule,
    ImportExportModule,
    PercentGraphModule,
  ],
  providers: [
    ProcessCoolingService,
    SystemBasicsFormService,
    ConvertProcessCoolingService,
    ProcessCoolingReportService
  ]
})
export class ProcessCoolingModule { }
