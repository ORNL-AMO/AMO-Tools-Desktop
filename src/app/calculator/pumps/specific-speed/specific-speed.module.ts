import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SpecificSpeedGraphComponent } from './specific-speed-graph/specific-speed-graph.component';
import { SpecificSpeedFormComponent } from './specific-speed-form/specific-speed-form.component';
import { SpecificSpeedComponent } from './specific-speed.component';
import { SpecificSpeedHelpComponent } from './specific-speed-help/specific-speed-help.component';
import { SpecificSpeedService } from './specific-speed.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';
import { SimpleTooltipModule } from '../../../shared/simple-tooltip/simple-tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule,
    SimpleTooltipModule
  ],
  declarations: [
    SpecificSpeedGraphComponent,
    SpecificSpeedComponent,
    SpecificSpeedFormComponent,
    SpecificSpeedHelpComponent
  ],
  exports: [
    SpecificSpeedComponent
  ],
  providers: [
    SpecificSpeedService
  ]
})
export class SpecificSpeedModule { }
