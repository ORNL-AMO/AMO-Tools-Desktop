import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { AtmosphereLossesCompareService } from "./atmosphere-losses-compare.service";
import { AtmosphereLossesService } from "./atmosphere-losses.service";
import { AtmosphereLossesFormComponent } from "./atmosphere-losses-form/atmosphere-losses-form.component";
import { AtmosphereLossesComponent } from "./atmosphere-losses.component";
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    AtmosphereLossesComponent,
    AtmosphereLossesFormComponent
  ],
  providers: [
    AtmosphereLossesCompareService,
    AtmosphereLossesService
  ],
  exports: [
    AtmosphereLossesComponent
  ]
})
export class AtmosphereLossesModule { }
