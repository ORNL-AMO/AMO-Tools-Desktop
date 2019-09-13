import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightingReplacementComponent } from './lighting-replacement.component';
import { LightingReplacementFormComponent } from './lighting-replacement-form/lighting-replacement-form.component';
import { LightingReplacementService } from './lighting-replacement.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LightingReplacementResultsComponent } from './lighting-replacement-results/lighting-replacement-results.component';
import { LightingReplacementHelpComponent } from './lighting-replacement-help/lighting-replacement-help.component';
import { SharedModule } from '../../../shared/shared.module';
import { ExportableResultsTableModule } from '../../../shared/exportable-results-table/exportable-results-table.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ExportableResultsTableModule
  ],
  declarations: [LightingReplacementComponent, LightingReplacementFormComponent, LightingReplacementResultsComponent, LightingReplacementHelpComponent],
  exports: [LightingReplacementComponent],
  providers: [
    LightingReplacementService
  ]
})
export class LightingReplacementModule { }
