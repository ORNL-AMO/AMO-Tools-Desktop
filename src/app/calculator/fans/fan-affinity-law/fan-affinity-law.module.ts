import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FanAffinityLawComponent } from './fan-affinity-law.component';
import { FanAffinityLawFormComponent } from './fan-affinity-law-form/fan-affinity-law-form.component';
import { FanAffinityLawHelpComponent } from './fan-affinity-law-help/fan-affinity-law-help.component';
import { FanAffinityLawService } from './fan-affinity-law.service';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';

@NgModule({
  declarations: [
    FanAffinityLawComponent,
    FanAffinityLawFormComponent,
    FanAffinityLawHelpComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExportableResultsTableModule
  ],
  exports: [FanAffinityLawComponent],
  providers: [FanAffinityLawService]
})
export class FanAffinityLawModule { }