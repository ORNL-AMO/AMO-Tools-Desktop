import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

import { FixtureLossesCompareService } from "./fixture-losses-compare.service";
import { FixtureLossesComponent } from "./fixture-losses.component";
import { FixtureLossesService } from "./fixture-losses.service";
import { FixtureLossesFormComponent } from "./fixture-losses-form/fixture-losses-form.component";

import { ModalModule } from 'ngx-bootstrap';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ModalModule,
    SuiteDbModule
  ],
  declarations: [
    FixtureLossesComponent,
    FixtureLossesFormComponent
  ],
  providers: [
    FixtureLossesCompareService,
    FixtureLossesService
  ],
  exports: [
    FixtureLossesComponent
  ]
})
export class FixtureLossesModule { }
