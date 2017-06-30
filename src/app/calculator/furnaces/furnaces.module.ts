import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { FurnacesComponent } from './furnaces.component';
import { O2EnrichmentFormComponent } from './o2-enrichment/o2-enrichment-form/o2-enrichment-form.component';

import { O2EnrichmentComponent } from './o2-enrichment/o2-enrichment.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    FurnacesComponent,
    O2EnrichmentFormComponent,
    O2EnrichmentComponent
  ],
  exports: [
    FurnacesComponent,
     O2EnrichmentComponent
  ]
})
export class FurnacesModule { }
