import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsModule } from '../../../settings/settings.module';
import { HeadToolComponent } from './head-tool.component';
import { HeadToolFormComponent } from './head-tool-form/head-tool-form.component';
import { HeadToolHelpComponent } from './head-tool-help/head-tool-help.component';
import { HeadToolResultsComponent } from './head-tool-results/head-tool-results.component';
import { HeadToolSuctionFormComponent } from './head-tool-suction-form/head-tool-suction-form.component';
import { HeadToolService } from './head-tool.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SettingsModule,
    ExportableResultsTableModule
  ],
  declarations: [
    HeadToolComponent,
    HeadToolFormComponent,
    HeadToolHelpComponent,
    HeadToolResultsComponent,
    HeadToolSuctionFormComponent
  ],
  exports: [
    HeadToolComponent
  ],
  providers: [
    HeadToolService
  ]
})
export class HeadToolModule { }
