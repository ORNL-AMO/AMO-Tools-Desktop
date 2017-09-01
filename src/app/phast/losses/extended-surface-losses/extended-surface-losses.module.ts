import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { ExtendedSurfaceLossesService } from './extended-surface-losses.service';
import { ExtendedSurfaceCompareService } from './extended-surface-compare.service';
import { ExtendedSurfaceLossesComponent } from './extended-surface-losses.component';
import { ExtendedSurfaceLossesFormComponent } from './extended-surface-losses-form/extended-surface-losses-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    ExtendedSurfaceLossesComponent,
    ExtendedSurfaceLossesFormComponent
  ],
  providers: [
    ExtendedSurfaceCompareService,
    ExtendedSurfaceLossesService
  ],
  exports: [
    ExtendedSurfaceLossesComponent
  ]
})
export class ExtendedSurfaceLossesModule { }
