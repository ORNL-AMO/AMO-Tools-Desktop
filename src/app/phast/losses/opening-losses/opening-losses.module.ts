import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { OpeningLossesService } from './opening-losses.service';
import { OpeningLossesCompareService } from './opening-losses-compare.service';
import { OpeningLossesComponent } from './opening-losses.component';
import { OpeningLossesFormComponent } from './opening-losses-form/opening-losses-form.component';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    SharedPipesModule
  ],
  declarations: [
    OpeningLossesComponent,
    OpeningLossesFormComponent
  ],
  providers: [
    OpeningLossesCompareService,
    OpeningLossesService
  ],
  exports: [
    OpeningLossesComponent
  ]
})
export class OpeningLossesModule { }
