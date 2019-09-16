import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { OtherLossesService } from './other-losses.service';
import { OtherLossesCompareService } from './other-losses-compare.service';
import { OtherLossesComponent } from './other-losses.component';
import { OtherLossesFormComponent } from './other-losses-form/other-losses-form.component';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  declarations: [
    OtherLossesComponent,
    OtherLossesFormComponent
  ],
  providers: [
    OtherLossesService,
    OtherLossesCompareService
  ],
  exports: [
    OtherLossesComponent
  ]
})
export class OtherLossesModule { }
