import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { O2EnrichmentHelpComponent } from '../o2-enrichment/o2-enrichment-help/o2-enrichment-help.component';
import { O2EnrichmentComponent } from '../o2-enrichment/o2-enrichment.component';
import { O2EnrichmentGraphComponent } from '../o2-enrichment/o2-enrichment-graph/o2-enrichment-graph.component';
import { O2EnrichmentFormComponent } from '../o2-enrichment/o2-enrichment-form/o2-enrichment-form.component';
import { O2EnrichmentService } from './o2-enrichment.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    O2EnrichmentFormComponent,
    O2EnrichmentComponent,
    O2EnrichmentGraphComponent,
    O2EnrichmentHelpComponent
  ],
  exports: [
    O2EnrichmentComponent
  ],
  providers: [
    O2EnrichmentService
  ]
})
export class O2EnrichmentModule { }
