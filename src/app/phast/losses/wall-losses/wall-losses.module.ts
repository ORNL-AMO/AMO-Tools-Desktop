import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { WallLossesService } from './wall-losses.service';
import { WallLossesComponent } from './wall-losses.component';
import { WallLossesFormComponent } from './wall-losses-form/wall-losses-form.component';
import { WallLossCompareService } from './wall-loss-compare.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    WallLossesComponent,
    WallLossesFormComponent
  ],
  providers: [
    WallLossesService,
    WallLossCompareService
  ],
  exports: [
    WallLossesComponent
  ]
})
export class WallLossesModule { }
